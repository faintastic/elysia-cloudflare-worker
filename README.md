
# Elysia Cloudflare Worker Example

Cloudflare worker example with Elysia as the http router, and a custom implementation of WebSocket due to when Elysia config `aot` is `False`, WebSocket requests do not work, `aot` needs to be `disabled` to work in the cloudflare worker environment.
- https://github.com/elysiajs/elysia/issues/1215


## Authors

- [@faintastic](https://www.github.com/faintastic)


## Features

- [Elysia](https://elysiajs.com/at-glance.html) HTTP Router
- Custom WebSocket Implementation (read description for reason)
- Seamless integration with Cloudflare workers



## Deployment

To test this project run:
```bash
    bun i
    bun run dev
```
**If you would like to change the development port off of `3000`, edit `src/index.ts` on line `71`**
 
To deploy this project to cloudflare workers run:
```bash
    bun i
    bun run deploy
```

`bun run deploy` will ask you to login to your cloudflare account via wrangler.

## Support

For support, you can either email me me@typescript.rocks, or contact me on telegram https://t.me/faintdev


## License [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

```
MIT License

Copyright (c) 2025 Faint

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
