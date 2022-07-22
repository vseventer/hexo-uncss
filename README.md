# uncss2 plugin for [Hexo](https://hexo.io)

> Remove unused styles from CSS with a [fork of uncss](https://github.com/NovaAtWarren/uncss).
> Original [uncss](https://github.com/giakki/uncss).

This plugin is a fork of [vseventer plugin](https://github.com/vseventer/hexo-uncss)

## Install

```bash
$ npm install hexo-uncss2 --save
```

## Options

You can configure this plugin in `_config.yml`.

```yaml
uncss:
  enable   : true
  ignore   : "#added_at_runtime"
  media    : (min-width: 700px) handheld and (orientation: landscape)
  priority : 10
  timeout  : 1000
  uncssrc  : .uncssrc
```

- **enable** - Enable the plugin. Defaults to `true`.
- **priority** - Set the filter priority. Lower priorities execute first. Defaults to `10`.
- All other options correspond to their [uncss](https://github.com/giakki/uncss#usage) equivalent.

## Debugging

Launch the node process like `DEBUG=hexo:uncss hexo ...` to inspect debug messages.

## Changelog

See the [Changelog](./CHANGELOG.md) for a list of changes.

## License

    [MIT License (MIT)](./LICENSE.txt)
