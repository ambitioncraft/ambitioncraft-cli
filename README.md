mc-cli
======



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mc-cli.svg)](https://npmjs.org/package/mc-cli)
[![Downloads/week](https://img.shields.io/npm/dw/mc-cli.svg)](https://npmjs.org/package/mc-cli)
[![License](https://img.shields.io/npm/l/mc-cli.svg)](https://github.com/MatthewOverall/mc-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @ambitioncraft/cli
$ mc COMMAND
running command...
$ mc (-v|--version|version)
@ambitioncraft/cli/0.3.0 linux-x64 node-v14.16.1
$ mc --help [COMMAND]
USAGE
  $ mc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mc backup SERVER`](#mc-backup-server)
* [`mc download SERVER`](#mc-download-server)
* [`mc execute SERVER MCCOMMAND`](#mc-execute-server-mccommand)
* [`mc help [COMMAND]`](#mc-help-command)
* [`mc list SERVER`](#mc-list-server)
* [`mc mirror SERVER`](#mc-mirror-server)
* [`mc mspt SERVER`](#mc-mspt-server)
* [`mc scoreboard SERVER OBJECTIVE`](#mc-scoreboard-server-objective)
* [`mc start SERVER`](#mc-start-server)
* [`mc status SERVER`](#mc-status-server)
* [`mc stop SERVER`](#mc-stop-server)

## `mc backup SERVER`

Backup individual regions

```
USAGE
  $ mc backup SERVER

ARGUMENTS
  SERVER  Name of the server (smp, cmp, copy)

OPTIONS
  -e, --end=end              end region
  -h, --help                 display command help
  -n, --nether=nether        nether region
  -o, --overworld=overworld  overworld region

EXAMPLES
  backup -o=1.1
  backup -o=0.1 -o=-1.1
  backup -o=0.1 -n=0.0
```

_See code: [src/commands/backup.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/backup.ts)_

## `mc download SERVER`

Download individual regions

```
USAGE
  $ mc download SERVER

ARGUMENTS
  SERVER  Name of the server (smp, cmp, copy)

OPTIONS
  -e, --end=end              end region
  -h, --help                 display command help
  -n, --nether=nether        nether region
  -o, --overworld=overworld  overworld region

ALIASES
  $ mc dl

EXAMPLES
  download -o=1.1 -o=1.2
  dl -n=0.1
  dl -e 0.0
```

_See code: [src/commands/download.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/download.ts)_

## `mc execute SERVER MCCOMMAND`

Execute a command using rcon

```
USAGE
  $ mc execute SERVER MCCOMMAND

ARGUMENTS
  SERVER     Name of the server (smp, cmp, copy)
  MCCOMMAND  Minecraft command to execute

OPTIONS
  -h, --help  display command help

ALIASES
  $ mc run

EXAMPLES
  execute cmp whitelist add ilmango
  run copy give ilmango minecraft:stone_axe
```

_See code: [src/commands/execute.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/execute.ts)_

## `mc help [COMMAND]`

display help for mc

```
USAGE
  $ mc help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `mc list SERVER`

list all players on a server

```
USAGE
  $ mc list SERVER

ARGUMENTS
  SERVER  Name of the server (smp, cmp, copy)

OPTIONS
  -h, --help  display command help

EXAMPLE
  list cmp
```

_See code: [src/commands/list.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/list.ts)_

## `mc mirror SERVER`

Mirror Regions To Copy

```
USAGE
  $ mc mirror SERVER

ARGUMENTS
  SERVER  Name of the server (smp, cmp, copy)

OPTIONS
  -e, --end=end              end region
  -h, --help                 display command help
  -n, --nether=nether        nether region
  -o, --overworld=overworld  overworld region

EXAMPLE
  mirror smp -o=1.1 -o=1.2
```

_See code: [src/commands/mirror.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/mirror.ts)_

## `mc mspt SERVER`

get the mspt of a server

```
USAGE
  $ mc mspt SERVER

ARGUMENTS
  SERVER  Name of the server (smp, cmp, copy)

OPTIONS
  -h, --help  display command help

EXAMPLE
  mspt cmp
```

_See code: [src/commands/mspt.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/mspt.ts)_

## `mc scoreboard SERVER OBJECTIVE`

displays a scoreboard

```
USAGE
  $ mc scoreboard SERVER OBJECTIVE

ARGUMENTS
  SERVER     Name of the server (smp, cmp, copy)
  OBJECTIVE  name of the scoreboard objective

OPTIONS
  -a, --allplayers  Include all players (not just whitelisted)
  -h, --help        display command help

ALIASES
  $ mc sb

EXAMPLES
  scoreboard smp deaths
  sb copy deaths --allplayers
  sb uhc deaths -a
```

_See code: [src/commands/scoreboard.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/scoreboard.ts)_

## `mc start SERVER`

start a server instance

```
USAGE
  $ mc start SERVER

ARGUMENTS
  SERVER  Name of the server (smp, cmp, copy)

OPTIONS
  -h, --help  display command help

EXAMPLES
  start smp
  start copy
```

_See code: [src/commands/start.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/start.ts)_

## `mc status SERVER`

see the status of a server instance

```
USAGE
  $ mc status SERVER

ARGUMENTS
  SERVER  Name of the server (smp, cmp, copy)

OPTIONS
  -h, --help  display command help

EXAMPLES
  status smp
  status copy
```

_See code: [src/commands/status.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/status.ts)_

## `mc stop SERVER`

stop a server instance

```
USAGE
  $ mc stop SERVER

ARGUMENTS
  SERVER  Name of the server (smp, cmp, copy)

OPTIONS
  -h, --help  display command help

EXAMPLES
  $stop smp
  $stop copy
```

_See code: [src/commands/stop.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.3.0/src/commands/stop.ts)_
<!-- commandsstop -->
