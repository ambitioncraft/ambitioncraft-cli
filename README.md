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
@ambitioncraft/cli/0.1.2 linux-x64 node-v13.14.0
$ mc --help [COMMAND]
USAGE
  $ mc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mc execute INSTANCENAME MCCOMMAND`](#mc-execute-instancename-mccommand)
* [`mc help [COMMAND]`](#mc-help-command)
* [`mc instance COMMAND`](#mc-instance-command)
* [`mc list INSTANCENAME`](#mc-list-instancename)
* [`mc make-server NAME`](#mc-make-server-name)
* [`mc make-world INSTANCENAME WORLDNAME`](#mc-make-world-instancename-worldname)
* [`mc mcprop INSTANCENAME`](#mc-mcprop-instancename)
* [`mc mspt INSTANCENAME`](#mc-mspt-instancename)
* [`mc scoreboard INSTANCENAME OBJECTIVE`](#mc-scoreboard-instancename-objective)
* [`mc start INSTANCENAME`](#mc-start-instancename)
* [`mc status INSTANCENAME`](#mc-status-instancename)
* [`mc stop INSTANCENAME`](#mc-stop-instancename)

## `mc execute INSTANCENAME MCCOMMAND`

Execute a command using rcon

```
USAGE
  $ mc execute INSTANCENAME MCCOMMAND

ARGUMENTS
  INSTANCENAME  Name of the server instance
  MCCOMMAND     Minecraft command to execute

OPTIONS
  -h, --help  display command help

ALIASES
  $ mc run

EXAMPLES
  $ mc execute uhc whitelist add ilmango
  $ mc run give ilmango minecraft:stone_axe
```

_See code: [src/commands/execute.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/execute.ts)_

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

## `mc instance COMMAND`

Execute a command across one or more instance

```
USAGE
  $ mc instance COMMAND

ARGUMENTS
  COMMAND  command to execute

OPTIONS
  -a, --all                execute command for all instances
  -i, --instance=instance  instance to use

ALIASES
  $ mc i

EXAMPLES
  $ mc instance mspt --all
  $ mc i status -i=uhc -i=uhc2
```

_See code: [src/commands/instance.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/instance.ts)_

## `mc list INSTANCENAME`

list all players on a server

```
USAGE
  $ mc list INSTANCENAME

ARGUMENTS
  INSTANCENAME  Name of the server instance

OPTIONS
  -h, --help  display command help

EXAMPLE
  $ mc list uhc
```

_See code: [src/commands/list.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/list.ts)_

## `mc make-server NAME`

Create a new Minecraft server instance.

```
USAGE
  $ mc make-server NAME

ARGUMENTS
  NAME  Name of the server instance. Must be lowercase and contain only letters, numbers, underscore, and hypens.

OPTIONS
  -h, --help         display command help
  -i, --image=image  (required) Minecraft Image Name (1.16.1, paper_1.16.3, ...)

ALIASES
  $ mc mkserver

EXAMPLES
  $ mc make-server
  $ mc make-server uhc
  $ mc mkserver uhc --image=1.16.2
```

_See code: [src/commands/make-server.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/make-server.ts)_

## `mc make-world INSTANCENAME WORLDNAME`

Create a new world on the same server.

```
USAGE
  $ mc make-world INSTANCENAME WORLDNAME

ARGUMENTS
  INSTANCENAME  Name of the server instance
  WORLDNAME     Name of the new world

OPTIONS
  -h, --help       display command help
  -r, --remake     remake the current world. This can only be done if the world was flagged as temporary
  -s, --seed=seed  seed of new world
  -t, --temp       helper to indicate this world is only temporary

ALIASES
  $ mc mkworld

EXAMPLES
  $ mc make-world uhc MyWorld --seed=19094829123
  $ mc make-world speedrun setseedworld --temp
  $ mc make-world speedrun setseedworld --temp --remake
  $ mc mkworld speedrun setseedworld -tr
```

_See code: [src/commands/make-world.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/make-world.ts)_

## `mc mcprop INSTANCENAME`

change a setting in minecraft.properties

```
USAGE
  $ mc mcprop INSTANCENAME

ARGUMENTS
  INSTANCENAME  Name of the server instance

OPTIONS
  -h, --help  display command help

EXAMPLE
  $ mc mcprop uhc level-name="my world"
```

_See code: [src/commands/mcprop.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/mcprop.ts)_

## `mc mspt INSTANCENAME`

get the mspt of a server

```
USAGE
  $ mc mspt INSTANCENAME

ARGUMENTS
  INSTANCENAME  Name of the server instance

OPTIONS
  -h, --help  display command help

EXAMPLE
  $ mc mspt uhc
```

_See code: [src/commands/mspt.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/mspt.ts)_

## `mc scoreboard INSTANCENAME OBJECTIVE`

displays the scoreboard associated to a specific objective

```
USAGE
  $ mc scoreboard INSTANCENAME OBJECTIVE

ARGUMENTS
  INSTANCENAME  Name of the server instance
  OBJECTIVE     name of the scoreboard objective

OPTIONS
  -h, --help       display command help
  -w, --whitelist  only show whitelisted players

ALIASES
  $ mc sb

EXAMPLES
  $ mc scoreboard uhc deaths
  $ mc sb uhc deaths --whitelist
  $ mc sb uhc deaths -w
```

_See code: [src/commands/scoreboard.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/scoreboard.ts)_

## `mc start INSTANCENAME`

start a server instance

```
USAGE
  $ mc start INSTANCENAME

ARGUMENTS
  INSTANCENAME  Name of the server instance

OPTIONS
  -h, --help  display command help

EXAMPLE
  $ mc start uhc
```

_See code: [src/commands/start.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/start.ts)_

## `mc status INSTANCENAME`

see the status of a server instance

```
USAGE
  $ mc status INSTANCENAME

ARGUMENTS
  INSTANCENAME  Name of the server instance

OPTIONS
  -h, --help  display command help

EXAMPLE
  $ mc status uhc
```

_See code: [src/commands/status.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/status.ts)_

## `mc stop INSTANCENAME`

stop a server instance

```
USAGE
  $ mc stop INSTANCENAME

ARGUMENTS
  INSTANCENAME  Name of the server instance

OPTIONS
  -h, --help  display command help

EXAMPLE
  $ mc stop uhc
```

_See code: [src/commands/stop.ts](https://github.com/ambitioncraft/ambitioncraft-cli/blob/v0.1.2/src/commands/stop.ts)_
<!-- commandsstop -->
