class Git {
    constructor(opt=null) {
        this.dir = `dst`
        this.username = opt?.username
        this.email = opt?.email
        this.token = opt?.token
        this.repo = opt?.repo
        this.remote = `origin`
        this.branch = `master`
        console.log(opt)
    }
    async init() {
        console.log('Git.init()')
        if (!this.#validInit()) { return }
        const exists = await window.myApi.exists(`${this.dir}/${this.repo}/.git`)
        console.log(exists)
        if(!exists) {
            await window.myApi.mkdir(`${this.dir}/${this.repo}`)
            let res = await window.myApi.shell(`cd "${this.dir}/${this.repo}/"; git init;`)
            console.log(res.stdout)
            console.log(`ローカルリポジトリを作成しました。`)
            res = await this.#remoteAddOrigin()
            console.log(res.stdout)
        } else {
            console.log(`${this.dir}/${this.repo}/.git は既存のためgit initしません。`)
        }
        return exists
    }
    async #validInit() {
        if (!this.username) { alert(`db/setting.jsonファイルにGitHubユーザ名をセットしてください`, true); return false; }
        if (!this.email) { alert(`db/setting.jsonファイルにGitHubメールアドレスをセットしてください`, true); return false; }
        if (!this.token) { alert(`db/setting.jsonファイルにGitHubアクセストークンをセットしてください\nrepoスコープ権限をもっている必要があります`, true); return false; }
        if (!this.repo) { alert(`db/setting.jsonファイルにGitHubリポジトリ名をセットしてください\n100字以内で英数字・記号は._-の3つのみ使用可`, true); return false; }
        return true
    }
    async #error() {

    }
    async push(message='追記') {
        //let res = await window.myApi.shell(`cd "${this.dir}/${this.repo}"; echo 'test file.' >| test.txt;`)
        //console.log(res.stdout)
        //res = await this.#setUser(this.username, this.email)
        let res = await this.#setUser()
        console.log(res.stdout)
        res = await this.#add()
        console.log(res.stdout)
        res = await this.#commit(message)
        console.log(res.stdout)
        res = await this.#push()
        console.log(res.stdout)
    }
    async #setUser(level='local') { // local, global, system
        console.log('setUser():', this.username, this.email, level)
        if (!['local', 'global', 'system'].includes(level)) { alert(`db/setting.jsonファイルにGitHubユーザ名をセットしてください`, true); return false; }
        const res1 = await window.myApi.shell(`cd "${this.dir}/${this.repo}/"; git config --${level} user.name '${this.username}';`)
        //console.log(res.stdout)
        const res2 = await window.myApi.shell(`cd "${this.dir}/${this.repo}/"; git config --${level} user.email '${this.email}';`)
        //console.log(res.stdout)
        return res1.stdout + '\n' + res2.stdout
    }
    /*
    // これやらないとcommit時以下エラーになる
    // Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: git push origin master
    // fatal: not a git repository (or any parent up to mount point /)
    // Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
    async #setUser() {
        console.log('setUser():', this.username, this.email)
        const res1 = await window.myApi.shell(`git config --global user.name '${this.username}'`)
        //console.log(res.stdout)
        const res2 = await window.myApi.shell(`git config --global user.email '${this.email}'`)
        //console.log(res.stdout)
        return res1.stdout + '\n' + res2.stdout
    }
    */
    /*
    // これやらないとcommit時以下エラーになる
    // Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: git push origin master
    // fatal: not a git repository (or any parent up to mount point /)
    // Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
    async #setUser(username, email, isLocal=false) {
        //const opt = '--' + ((isLocal) ? 'global' : 'local')
        //const opt = '--' + ((true==isLocal) ? 'global' : 'local')
        //console.log('setUser():', username, email, isLocal, opt)
        //console.log('setUser():', username, email, isLocal, ((isLocal) ? 'global' : 'local'), opt)
        //await window.myApi.shell(`git config ${opt} user.name '${username}'`)
        //await window.myApi.shell(`git config ${opt} user.email '${email}'`)
        console.log('setUser():', username, email)
        let res = await window.myApi.shell(`git config --global user.name '${username}'`).stdout
        //console.log(res.stdout)
        res += '\n' + await window.myApi.shell(`git config --global user.email '${email}'`).stdout
        //console.log(res.stdout)
        return res
    }
    */
    async #add() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git add .;`)
    }
    async #addList() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git add -n .;`)
    }
    async #commit(message) {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git commit -m '${message}';`)
    }
    async #remoteAddOrigin() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git remote add ${this.remote} "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git";`)
    }
    async #remoteSetUrlOrigin() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git remote set-url ${this.remote} "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git";`)
    }
    async #push() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git push ${this.remote} ${this.branch}`)
    }

    /*
    async push(options) {
        // リポジトリがなければ作成する(init)
        // add, commit, push
        let res = await window.myApi.shell(`cd ./repo/${options.repository}`)
        console.debug(res.stdout)
        this.#init()
    }
    async #add() {
        await window.myApi.shell(`git add .`)
    }
    async #addList() {
        await window.myApi.shell(`git add -n .`)
    }
    async #commit(message) {
        await window.myApi.shell(`git commit -m '${message}'`)
    }
    async #remoteAddOrigin() {
        await window.myApi.shell(`git remote add origin "https://${username}:${token}@github.com/${username}/${repo}.git"`)
    }
    async #remoteSetUrlOrigin() {
        await window.myApi.shell(`git remote set-url origin "https://${username}:${token}@github.com/${username}/${repo}.git"`)
    }
    async #push() {
        await window.myApi.shell(`git push origin ${this.branch}`)
    }
    async #setUser(username, email, isLocal=false) {
        const opt = '--' + ((isLocal) ? 'global' : 'local')
        await window.myApi.shell(`git config ${opt} user.name '${username}'`)
        await window.myApi.shell(`git config ${opt} user.email '${email}'`)
    }
    */
}
