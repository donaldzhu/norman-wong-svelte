import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { compile } from 'svelte/compiler'
import { render } from 'svelte/server'

const require = createRequire(import.meta.url)
const filename = new URL('../src/routes/_components/selected/selectedProjectSection.svelte', import.meta.url)
const source = readFileSync(filename, 'utf8')
// Isolate the real link template from route state and the unrelated media renderer.
const fixtureSource = source
  .replace(/import \{ page \} from "\$app\/state"/, 'const page = { url: { pathname: "/" } }')
  .replace(/import \{ isProjectRoute \} from "\$lib\/utils\/url"/, 'const isProjectRoute = () => false')
  .replace(/import ProjectSlide from "[^\"]+"/, 'const ProjectSlide = () => {}')
  .replace(/<style[\s\S]*?<\/style>/, '')
const compiled = compile(fixtureSource, { filename: filename.pathname, generate: 'server' }).js.code
const executable = compiled.replace(/from (["'])(svelte[^"']*)\1/g, (_, quote, specifier) =>
  `from ${JSON.stringify(pathToFileURL(require.resolve(specifier)).href)}`)
const { default: SelectedProjectSection } = await import(`data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`)

test('Selected Works renders native project URLs for ordinary and modified link actions', () => {
  for (const slug of ['octobers-very-own', 'ssense-moncler']) {
    const { body } = render(SelectedProjectSection, { props: {
      project: { title: 'Fixture project', slug: { current: slug }, slides: [] },
      isSelected: false, isNavigating: false, isSettled: true,
      isHighlighted: false, onNavigate: () => {},
    } })
    assert.match(body, new RegExp(`href="/projects/${slug}/1"`))
    assert.doesNotMatch(body, /href="[^"]*\$/)
    assert.match(body, /Fixture project/)
  }
})
