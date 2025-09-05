const esbuild = require('esbuild')
const path = require('node:path')

async function build() {
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../electron-src/main.ts')],
    outfile: path.resolve(__dirname, '../electron/main.cjs'),
    bundle: true,
    platform: 'node',
    external: ['electron'],
    sourcemap: true,
    target: ['node18'],
    format: 'cjs',
  })

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../electron-src/preload.ts')],
    outfile: path.resolve(__dirname, '../electron/preload.cjs'),
    bundle: true,
    platform: 'node',
    external: ['electron'],
    sourcemap: true,
    target: ['node18'],
    format: 'cjs',
  })
}

build().catch((e) => {
  console.error(e)
  process.exit(1)
})


