class Thumbnail {
    
    constructor(control){
        this.control = control;
    }

    // サムネイル表示
    async refresh(){
        const files = await s3.getFiles();
        this.control.empty()
        await Promise.all(files.map( async file => {
            if(file.indexOf('S_') === 0){
                const url = await s3.getSignedUrl(file);
                const tmp = file.replace("S_","").replace(".jpg","").split('_');
                const name = tmp[0];
                const label = tmp[1];
                const img = $("<img>");
                img.attr("src",url);
                const a = $("<a>");
                a.attr("name", name);
                a.attr('id', label);
                a.on('click', this.cinfirm);
                a.append(img);
                this.control.append(a)
            }
        }))
    }

    // 削除
    async cinfirm(){
        setBusy(true);

        const result = window.confirm(`${this.name} [${this.id}] を削除して宜しいですか`);
        if(result) {

            await s3.delete(this.name + '.json');
            await s3.delete('S_' + this.name + '_' + this.id+ '.jpg');
            await s3.delete('L_' + this.name + '.jpg');

            // マニュフェスト初期化（既存のManifest取得）
            await manifest.init(s3);
            // サムネイル表示
            await thumbnail.refresh()

        }
        setBusy(false);
    }
}