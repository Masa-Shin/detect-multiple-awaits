import { describe, it, expect } from "vitest";
import { extractScript } from "../../lib/extractScript";

describe("extractScriptFromVue", () => {
  it.each([
    {
      source: `
      <template>
        <div class="hello">hello</div>
      </template>

      <script lang="ts">
        import Vue from 'vue'

        export Vue.extend({
          name: 'HelloWorld',
          data() {
            return {
              message: 'Hello World!'
            }
          }
        })
      </script>

      <style>
        .hello {
          color: red;
        }
      </style>
      `,
      expected: `
        import Vue from 'vue'

        export Vue.extend({
          name: 'HelloWorld',
          data() {
            return {
              message: 'Hello World!'
            }
          }
        })
      `,
    },
    {
      source: `
      <template>
        <div class="hello">hello</div>
      </template>

      <script>
        import Vue from 'vue'

        // export
        export Vue.extend({
          name: 'HelloWorld',
          data() {
            return {
              message: 'Hello World!'
            }
          }
        })
      </script>

      <style>
        .hello {
          color: red;
        }
      </style>
      `,
      expected: '',
    },
  ])("extractScript", ({ source, expected }) => {
    const result = extractScript(source);

    expect(result).toEqual(expected);
  });
});
