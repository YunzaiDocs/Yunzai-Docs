import { execSync } from 'child_process'

const Version = {
  getRepositoryUrl(){
    return execSync('git config --get remote.origin.url').toString().trim()

  }
}

export default Version