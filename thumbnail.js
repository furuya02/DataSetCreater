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
                const name = file.replace("S_","").replace(".jpg","");
                const img = $("<img>");
                img.attr("src",url);
                const a = $("<a>");
                a.attr("name", name);
                a.on('click', this.cinfirm);
                a.append(img);
                this.control.append(a)
            }
        }))
    }

    // 削除
    async cinfirm(){
        const result = window.confirm(this.name + " を削除して宜しいですか");
        if(result) {
            await s3.delete(this.name + '.json');
            await s3.delete('S_' + this.name + '.jpg');
            await s3.delete('L_' + this.name + '.jpg');

            // マニュフェスト初期化（既存のManifest取得）
            await manifest.init(s3);
            // サムネイル表示
            await thumbnail.refresh()
        }
    }
}