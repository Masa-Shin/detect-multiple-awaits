import colors from "ansi-colors";
import { readFile } from "fs/promises";
import glob from "glob";
import { Project, SyntaxKind } from "ts-morph";
import { extractScript } from "./lib/extractScript";
import { generateProgressBar } from "./lib/progressBar";

const getName = (func: any) => {
  if (func.getName) return func.getName()

  // 変数に関数を格納している場合、その変数名を返す
  const parent = func.getParent()
  if (parent && parent.getKind() === SyntaxKind.VariableDeclaration) {
    return parent.getNameNode().getText()
  }

  // TODO: func: () => {}のようなオブジェクトの値である場合

  return '<unknown function>'
}

export const fileHandler = async ({
  targetPathPattern,
}: {
  targetPathPattern: string;
}): Promise<void> => {
  const filePaths = glob.sync(targetPathPattern, {
    ignore: "./**/node_modules/**/*",
  });

  // ファイルパス群からいろんな情報を含んだFileInfoオブジェクトを作成
  const allFiles = await Promise.all(
    filePaths.map(async (path) => {
      const fullText = await readFile(path, "utf8")
      const script = extractScript(fullText)

      return {
        path,
        fullText,
        script,
      };
    })
  );

  // Start progress bar
  const progressBar = generateProgressBar(colors.green);
  progressBar.start(allFiles.length, 0);

  // ScriptからTSファイルを作成する
  const project = new Project({
    useInMemoryFileSystem: true,
  })
  const targetFilesWithSourceFile = allFiles.map((file) => {
    const sourceFile = project.createSourceFile(`${file.path}.ts`, file.script);
    return {
      ...file,
      sourceFile,
    };
  });

  // awaitを検出した結果を格納する
  const findResult: Record<string, {
    name: number
    numberOfAwaits: number
    lineNumber: number
  }[]> = {}

  for await (const file of targetFilesWithSourceFile) {
    // scriptタグがないファイルはskip
    if (file.script === "") {
      progressBar.increment()
      continue
    }

    // 関数定義を抜き出す
    const asyncFunctionDeclarations = file.sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
      .filter((func) => func.isAsync())
    
    const asyncFunctionExpressions = file.sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression)
      .filter((func) => func.isAsync())

    const asyncArrowFunctions = file.sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction)
      .filter((func) => func.isAsync())

    const asyncMethod = file.sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration)
      .filter((func) => func.isAsync())

    const asyncFunctions = [
      ...asyncFunctionDeclarations,
      ...asyncFunctionExpressions,
      ...asyncArrowFunctions,
      ...asyncMethod,
    ]
  
    // 関数の中からawaitを探す
    for (const func of asyncFunctions) {
      const block = func.getBody()
      if (!block) continue

      const awaits = block.getDescendantsOfKind(SyntaxKind.AwaitKeyword)

      if(awaits.length > 1) {
        if(!findResult[file.path]) {
          findResult[file.path] = []
        } 
        findResult[file.path].push({
          name: getName(func),
          numberOfAwaits: awaits.length,
          lineNumber: func.getStartLineNumber() // Only works with JS/TS files.
        })
      }
    }

    progressBar.increment();
  }
  progressBar.stop()

  // 結果を出力
  Object.entries(findResult).forEach(([path, values]) => {
    console.log(`\n🗄 ${path}`)
    
    values.forEach(value => {
      console.log(`  - ${value.name}() at ${path}:${value.lineNumber} has ${value.numberOfAwaits} await keyword(s).`);
    })
  })
}
