# git pushエラー

```
Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: git push origin master
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
```

# github.js

## init

```
git init
git remote add origin "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git"
https://docs.github.com/ja/rest/repos/repos#create-a-repository-for-the-authenticated-user
```

## push

```
git config --global user.name '${username}'
git config --global user.email '${email}'
```
```
git add .
git commit -m '${message}'
git push origin ${this.branch}
```

　`push`のところで以下エラーが出る。原因は`git remote add origin $URL`できていないこと。

```
Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: cd "dst/mytestrepo"; git push origin master
fatal: 'origin' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

　`push`のところで以下エラーが出る。原因はpushの直前でカレントディレクトリをリポジトリにしなかったこと。

```
Uncaught (in promise) Error: Error invoking remote method 'shell': Error: Command failed: git push origin master
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
```









なぜかgit pushを2回しないとアップされない問題

　simple-gitパッケージをやめてコマンド直打ちで実装し直した。それでも`git push`を2回すればアップできた。なぜ2回必要なのかは原因不明。

<!-- more -->

# ブツ

* [リポジトリ][]

[リポジトリ]:https://github.com/ytyaru/Electron.MyLog.git.push.20220903094945

## インストール＆実行

```sh
NAME='Electron.MyLog.git.push.20220903094945'
git clone https://github.com/ytyaru/$NAME
cd $NAME
npm install
npm start
```

### 準備

1. [GitHubアカウントを作成する](https://github.com/join)
1. `repo`スコープ権限をもった[アクセストークンを作成する](https://github.com/settings/tokens)
1. [インストール＆実行](#install_run)してアプリ終了する
	1. `db/setting.json`ファイルが自動作成される
1. `db/setting.json`に以下をセットしファイル保存する
	1. `username`:任意のGitHubユーザ名
	1. `email`:任意のGitHubメールアドレス
	1. `token`:`repo`スコープ権限を持ったトークン
	1. `repo`:任意リポジトリ名（`mytestrepo`等）
	1. `address`:任意モナコイン用アドレス（`MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu`等）
1. `dst/mytestrepo/.git`が存在しないことを確認する（あれば`dst`ごと削除する）
1. GitHub上に同名リモートリポジトリが存在しないことを確認する（あれば削除する）

### 実行

1. `npm start`で起動またはアプリで<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>キーを押す（リロードする）
1. `git init`コマンドが実行される
	* `repo/リポジトリ名`ディレクトリが作成され、その配下に`.git`ディレクトリが作成される
1. [createRepo][]実行後、リモートリポジトリが作成される

### GitHub Pages デプロイ

　アップロードされたファイルからサイトを作成する。

1. アップロードしたユーザのリポジトリページにアクセスする（`https://github.com/ユーザ名/リポジトリ名`）
1. 設定ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings`）
1. `Pages`ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings/pages`）
    1. `Source`のコンボボックスが`Deploy from a branch`になっていることを確認する
    1. `Branch`を`master`にし、ディレクトリを`/(root)`にし、<kbd>Save</kbd>ボタンを押す
    1. <kbd>F5</kbd>キーでリロードし、そのページに`https://ytyaru.github.io/リポジトリ名/`のリンクが表示されるまでくりかえす（***数分かかる***）
    1. `https://ytyaru.github.io/リポジトリ名/`のリンクを参照する（デプロイ完了してないと404エラー）

　すべて完了したリポジトリとそのサイトが以下。

* [作成DEMO][]
* [作成リポジトリ][]

[作成DEMO]:https://ytyaru.github.io/Electron.MyLog.git.push.Upload.Test.20220903094945/
[作成リポジトリ]:https://github.com/ytyaru/Electron.MyLog.git.push.Upload.Test.20220903094945

# 経緯

[Electron.MyLog.20220831094901]:https://github.com/ytyaru/Electron.MyLog.20220831094901
[Electron.simple.git.20220902105438]:https://github.com/ytyaru/Electron.simple.git.20220902105438

リポジトリ|結果
----------|----
[Electron.MyLog.20220831094901][]|なぜか`asset/`ディレクトリがアップされない（ローカルにはあるのに）
[Electron.simple.git.20220902105438][]|なぜか２回目のpushでアップされた

　simple-gitパッケージを使わず、gitコマンドを叩くだけでも、同じように2回目のpushでアップされるかもしれない。そう思って今回、試してみたところ、成功した。

# コード抜粋

## renderer.js

```javascript
const exists = await git.init(document.getElementById('github-repo').value)
if (!exists) { // .gitがないなら
    const res = await hub.createRepo({
        'name': `${setting.github.repo}`,
        'description': 'リポジトリの説明',
    }, setting)
    await maker.make()
    await git.push('新規作成')
    await git.push('なぜか初回pushではasset/ディレクトリなどがアップロードされないので２回やってみる') 
}
```

　アプリが起動したとき、かつローカルリポジトリが存在しない場合、以下のようにして必要なファイルをアップロードする。

1. `git init`して作成
1. リモートリポジトリ作成
1. サイト作成に必要なファイル一式を作成
1. `git push`する
1. なぜか初回だけだと全ファイルがアップされないので２回目の`git push`も直後に行う

　これで全ファイルがアップされた。2回`git push`が必要な理由が謎。

　とにかく、なぜか2回`git push`しないとファイルのアップロードが完了しないのはわかった。

　それはsimple-gitパッケージを使おうが、裸のコマンドで叩こうが同じ。ならパッケージがないほうがムダな依存関係を減らせるので助かる。というわけで、simple-gitパッケージは使わずに実装することにした。

　今後もまだまだ未知で謎で原因不明なバグが山ほど出てくる予感しかしない……。

## git.js

　コマンド直打ちしているコードは以下。最初にわざわざ毎回`cd`でカレントディレクトリをセットしている以外は、ふつうにコマンドを叩いている。

```javascript
class Git {
    async init(repo) {
        this.repo = repo
        const exists = await window.myApi.exists(`${this.dir}/${this.repo}/.git`)
        if(!exists) {
            await window.myApi.mkdir(`${this.dir}/${this.repo}`)
            let res = await window.myApi.shell(`cd "${this.dir}/${this.repo}/"; git init;`)
            res = await this.#remoteAddOrigin()
        } else {
            console.log(`${this.dir}/${this.repo}/.git は既存のためgit initしません。`)
        }
        return exists
    }
    async push(message='追記') {
        let res = await this.#setUser()
        res = await this.#add()
        res = await this.#commit(message)
        res = await this.#push()
    }
    async #setUser() {
        console.log('setUser():', this.username, this.email)
        const res1 = await window.myApi.shell(`git config --global user.name '${this.username}'`)
        const res2 = await window.myApi.shell(`git config --global user.email '${this.email}'`)
        return res1.stdout + '\n' + res2.stdout
    }
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
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git remote add origin "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git";`)
    }
    async #remoteSetUrlOrigin() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git remote set-url origin "https://${this.username}:${this.token}@github.com/${this.username}/${this.repo}.git";`)
    }
    async #push() {
        return await window.myApi.shell(`cd "${this.dir}/${this.repo}"; git push origin ${this.branch}`)
    }
}
```






　一応、`pushテスト`ボタンでも`git push`できる。コミットメッセージは`追記:yyyy-MM-DDTHH:mm:ss.fffZ`となる。

```javascript
document.querySelector('#push-test').addEventListener('click', async()=>{
    await git.push()
})
```

