## [0.9.1](https://github.com/NatxioDev/kibo-dev/compare/v0.9.0...v0.9.1) (2026-10-03)

### Bug Fixes

* **dashboard:** function for default date time range ([7fc6426](https://github.com/NatxioDev/kibo-dev/commit/7fc6426519033e53e47c2afe2a9ee5fc2e45696a))
* **dashboard:** set last three months as default date range ([aacc32c](https://github.com/NatxioDev/kibo-dev/commit/aacc32ceedd1ac72a8c85ad95fe2f478af848d5b))

## [0.9.0](https://github.com/NatxioDev/kibo-dev/compare/v0.8.1...v0.9.0) (2026-09-29)

### Features

* **accounts:** modelar cuentas y asociarlas a transacciones (KIBO-72) ([7ad3e5d](https://github.com/NatxioDev/kibo-dev/commit/7ad3e5d0147584bdb1b15efdf0715070c90fa4b0))
* **accounts:** pulir registro con cuentas y sugerencias completas ([b43033a](https://github.com/NatxioDev/kibo-dev/commit/b43033a4996f4e8e7f7f6e45746bf31823ccd71b))
* **dashboard:** allow hiding balance with eye toggle ([7fb9dca](https://github.com/NatxioDev/kibo-dev/commit/7fb9dcaea254e30e533bdad69b1e2f5278de94fc))
* **login:** experiencia de bienvenida con emojis de funcionalidades ([caf4f24](https://github.com/NatxioDev/kibo-dev/commit/caf4f243979af8f8f11164bdc7906417c4da1773))
* **transactions:** filtro por rango de fechas en /transactions (KIBO-23) ([551ea2d](https://github.com/NatxioDev/kibo-dev/commit/551ea2de2d31f4567e3291f04c77d02e74211abf))
* **transactions:** filtros compactos para mobile (KIBO-77) ([b67180a](https://github.com/NatxioDev/kibo-dev/commit/b67180a36b27e6305ee1e117ec4f3eff7c3783fc))
* **transactions:** filtros más claros con contador y limpiar ([1adedce](https://github.com/NatxioDev/kibo-dev/commit/1adedce11eb48a72279c6deb1313111b4a09395c))

### Bug Fixes

* **dashboard:** center balance visibility eye with label ([b6ca96c](https://github.com/NatxioDev/kibo-dev/commit/b6ca96ca54dc663e6a284b600ae197b799ee5ea8))
* **dashboard:** ocultar barra de ingresos vs gastos sin movimientos ([7e4418c](https://github.com/NatxioDev/kibo-dev/commit/7e4418c26cd3173fab95370051caff23ab3495ee))
* replace curly quotes with straight quotes in releases.ts ([15ac330](https://github.com/NatxioDev/kibo-dev/commit/15ac33060bd827265eea1c9a4863940205308405))
* **transactions:** conservar cuenta inactiva al editar movimientos ([13dd075](https://github.com/NatxioDev/kibo-dev/commit/13dd075ceedcc0e38506e0c00d2d76650a43ce8c))
* **transactions:** no filtrar por cuenta cuando se eligen todas ([39133f4](https://github.com/NatxioDev/kibo-dev/commit/39133f4fec2524c8bcf9347282b58c52d124307d))

## [0.8.1](https://github.com/NatxioDev/kibo-dev/compare/v0.8.0...v0.8.1) (2026-09-28)

### Bug Fixes

* **transactions:** mostrar horas en America/La_Paz ([bf7b96a](https://github.com/NatxioDev/kibo-dev/commit/bf7b96af0edfdd6edae0af9bab73b2ce3238a3f4))

## [0.8.0](https://github.com/NatxioDev/kibo-dev/compare/v0.7.1...v0.8.0) (2026-09-27)

### Features

* **auth:** add Passkeys (WebAuthn) login and management ([037d98a](https://github.com/NatxioDev/kibo-dev/commit/037d98a81dc50892c2db3e32f5549b883c0bfc21))

### Bug Fixes

* **auth:** replace Passkey login icon with a clear key glyph ([5533c0d](https://github.com/NatxioDev/kibo-dev/commit/5533c0daf45e198044779e30749ab7621d219990))

## [0.7.1](https://github.com/NatxioDev/kibo-dev/compare/v0.7.0...v0.7.1) (2026-09-27)

### Bug Fixes

* **categories:** allow only a single emoji as category icon ([83c3a63](https://github.com/NatxioDev/kibo-dev/commit/83c3a639a2244f5c462cc7aca09aa7c09d1569f4))
* **settings:** limit category and payment method name length ([ee18c81](https://github.com/NatxioDev/kibo-dev/commit/ee18c810f81b8845aa9889e19c88100b3bcc825b))

## [0.7.0](https://github.com/NatxioDev/kibo-dev/compare/v0.6.0...v0.7.0) (2026-09-27)

### Features

* **changelog:** sección Novedades y aviso de versión (CUC-60) ([bab2025](https://github.com/NatxioDev/kibo-dev/commit/bab20256912801fd9747b01a76a3e1cf414191d0))
* **friends:** amigos por [@username](https://github.com/username) (CUC-19) para v0.7.0 ([#55](https://github.com/NatxioDev/kibo-dev/issues/55)) ([ab0d750](https://github.com/NatxioDev/kibo-dev/commit/ab0d750762c5e229ec765671c158e987bd6dec67))
* **splits:** gastos compartidos y deudas entre amigos (CUC-61) ([efbcac0](https://github.com/NatxioDev/kibo-dev/commit/efbcac08ec82ee554a93bafc2ed715f7772e4919))

## [0.6.0](https://github.com/NatxioDev/kibo-dev/compare/v0.5.1...v0.6.0) (2026-09-26)

### Features

* **settings:** add install app section with per-device PWA guides ([bffaf16](https://github.com/NatxioDev/kibo-dev/commit/bffaf16e04fe59a731f4d93d0f292fb543c6302d))

## [0.5.1](https://github.com/NatxioDev/kibo-dev/compare/v0.5.0...v0.5.1) (2026-09-26)

### Bug Fixes

* keep default iOS status bar style in standalone mode ([c595d08](https://github.com/NatxioDev/kibo-dev/commit/c595d083b1d11aeae50df85d1140d47c177d408f))

## [0.5.0](https://github.com/NatxioDev/kibo-dev/compare/v0.4.0...v0.5.0) (2026-09-26)

### Features

* make app installable as a PWA ([16ff852](https://github.com/NatxioDev/kibo-dev/commit/16ff8529f169b68875d94252fbedea4faba98eda))

## [0.4.0](https://github.com/NatxioDev/kibo-dev/compare/v0.3.0...v0.4.0) (2026-09-26)

### Features

* show beta stage next to app version and add founder badge dream ([6eddc5b](https://github.com/NatxioDev/kibo-dev/commit/6eddc5b511cfba921cab789387f9301e85780404))

## [0.3.0](https://github.com/NatxioDev/kibo-dev/compare/v0.2.3...v0.3.0) (2026-09-26)

### Features

* implementar nuevo logo de marca Kibo ([14485f6](https://github.com/NatxioDev/kibo-dev/commit/14485f6f274588c08c7ca3e7ea1bf2efa72edb85))

## [0.2.3](https://github.com/NatxioDev/kibo-dev/compare/v0.2.2...v0.2.3) (2026-09-26)

### Bug Fixes

* **transactions:** group thousands in the amount input while typing ([ea42136](https://github.com/NatxioDev/kibo-dev/commit/ea42136ddd93311b6495c8c693509dfb2c641be5))

## [0.2.2](https://github.com/NatxioDev/kibo-dev/compare/v0.2.1...v0.2.2) (2026-09-26)

### Bug Fixes

* **transactions:** limit merchant and note length ([b08d02b](https://github.com/NatxioDev/kibo-dev/commit/b08d02b2c9d52258faf162ed729b88ea97c2529a))

## [0.2.1](https://github.com/NatxioDev/kibo-dev/compare/v0.2.0...v0.2.1) (2026-09-26)

### Bug Fixes

* **transactions:** add Money/Currency value objects for currency separators ([06c4002](https://github.com/NatxioDev/kibo-dev/commit/06c40024cf710cf837d513641a71bc5d30ddbb91))

## [0.2.0](https://github.com/NatxioDev/kibo-dev/compare/v0.1.0...v0.2.0) (2026-09-26)

### Features

* **ui:** liquid glass redesign and per-category colors ([dd85131](https://github.com/NatxioDev/kibo-dev/commit/dd851317787d383c12e065f68ec1d888f639768e))

## [0.1.0](https://github.com/NatxioDev/kibo-dev/compare/v0.0.5...v0.1.0) (2026-09-25)

### Features

* **auth:** login con Google y perfil con username unico ([7460912](https://github.com/NatxioDev/kibo-dev/commit/74609123dcf1677118d8df2144a9f9213bd381b7))
* **auth:** login con Google y perfil con username unico ([8d48437](https://github.com/NatxioDev/kibo-dev/commit/8d48437f0123da169cc305265a857ab8b69e0a80))
* refactor application structure to implement clean architecture ([fe41d92](https://github.com/NatxioDev/kibo-dev/commit/fe41d92e728580e5a200c8a95d06cba360c3948b))
* refactor application structure to implement Clean Architecture, ([c91b609](https://github.com/NatxioDev/kibo-dev/commit/c91b609f876c4b6568783ec0c7990eca69157bab))

### Bug Fixes

* **ci:** pin conventionalcommits preset to v9 for semantic-release compatibility ([562a093](https://github.com/NatxioDev/kibo-dev/commit/562a093b645f54f11c9b67aa79de9236d6e3f223))
