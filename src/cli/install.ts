import {
  formatDistanceToNow,
  parseISO,
} from "@johnlindquist/kit-internal/date-fns"
import { KIT_FIRST_PATH } from "../core/utils.js"

let install = async packageNames => {
  let cwd = kenvPath()

  if (process.env.SCRIPTS_DIR) {
    cwd = kenvPath(process.env.SCRIPTS_DIR)
  }

  let isYarn = await isFile(kenvPath("yarn.lock"))
  let [tool, command] = (
    isYarn
      ? `yarn${global.isWin ? `.cmd` : ``} add`
      : `npm${global.isWin ? `.cmd` : ``} i`
  ).split(" ")

  let PATH = isWin ? "" : `PATH=${knodePath("bin")}:$PATH `

  return await term({
    command:
      `${PATH}${tool} ${command} -D ${packageNames.join(
        " "
      )}`.trim(),
    env: {
      ...global.env,
      PATH: KIT_FIRST_PATH,
    },
    cwd,
  })
}

let packages = await arg(
  {
    enter: "Install",
    placeholder:
      "Which npm package/s would you like to install?",
  },
  async input => {
    if (!input || input?.length < 3)
      return [
        {
          name: `Search for npm packages`,
          disableSubmit: true,
        },
      ]
    type pkgs = {
      objects: {
        package: {
          name: string
          description: string
          date: string
        }
      }[]
    }
    let response = await get<pkgs>(
      `http://registry.npmjs.com/-/v1/search?text=${input}&size=20`
    )
    let packages = response.data.objects
    return packages.map(o => {
      return {
        name: o.package.name,
        value: o.package.name,
        description: `${
          o.package.description
        } - ${formatDistanceToNow(
          parseISO(o.package.date)
        )} ago`,
      }
    })
  }
)

let installNames = [...packages.split(" ")]
global.setChoices([])
await install([...installNames, ...argOpts])

export { packages }
