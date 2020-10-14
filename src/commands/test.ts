
// import Command, {flags} from '@oclif/command'
// import * as Parser from '@oclif/parser'
// import shell from 'shelljs'
// import config from '../config.json'

// // export default class TestCommand extends Command {

// //   static description = 'test command'

// //   static examples = [
// //     '$ mc test blah',
// //   ]

// //   static args: Parser.args.IArg<any>[] = [
// //     { name: 'foo', required: true, description: 'foo' },
// //   ]

// //   static flags: flags.Input<any> = {
// //     help: flags.help({ char: 'h', description: 'show help' }),
// //   }

// //   async run() {
// //     const { flags, args } = this.parse(<any>this.constructor)
// //     console.log(flags, args)
// //   }

// // // }
// // abstract class TestCommandBase extends Command {
// //   // args: any
// //   // flags: any
// //   async init() {
// //     console.log('init testcommandbase1')
// //     super.init()
// //     console.log('init testcommandbase1 again')
// //     // const { flags, args } = this.parse(<any>this.constructor)
// //     // this.flags = flags
// //     // this.args = args
// //   }
// // }

// abstract class TestCommandBase2 extends Command {
//   args: any
//   flags: any
//   static args: Parser.args.IArg<any>[] = [
//     {name: 'foo', required: true, description: 'foo'},
//   ]

//   static flags: flags.Input<any> = {
//     help: flags.help({description: 'show help'}),
//   }

//   async init() {
//     console.log('init testcommandbase2')
//     await super.init()
//     const {flags, args} = this.parse(this.constructor as any)
//     this.flags = flags
//     this.args = args
//   }
// }

// export default class TestCommand extends TestCommandBase2 {
//   static description = 'test command'

//   static examples = [
//     '$ mc test blah',
//   ]

//   static args: Parser.args.IArg<any>[] = [
//     ...TestCommandBase2.args,
//   ]

//   static flags: flags.Input<any> = {
//     ...TestCommandBase2.flags,
//   }

//   // eslint-disable-next-line require-await
//   async run() {
//     console.log(this.flags, this.args)

//     return ''
//   }
// }

