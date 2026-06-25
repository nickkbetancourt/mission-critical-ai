# Sites Worker ESM starter

Use this starter for a static microsite, click counter, or simple internal UI whose state is browser-local. It has no dependencies and needs no `npm install`.

Build and validate it with tools already present in the Sites Linux environment:

```sh
bash scripts/build.sh
node scripts/validate-artifact.mjs
```

The deterministic build copies two source files into the required archive shape:

```text
dist/
├── .openai/
│   └── hosting.json
└── server/
    └── index.js
```

For simple static sites, package this shape:

```sh
tar -czf site.tar.gz dist
```

`dist/server/index.js` is an ES module with a default export containing `fetch(request, env, ctx)`. Edit `worker/index.js`, not the generated file under `dist/`.
