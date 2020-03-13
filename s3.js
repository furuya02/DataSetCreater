class S3 {
    constructor(bucketName, folder){
        // 2020-03-12現在、us-east-1でないと、Rekognition Custom Labelsでデータセットに登録できない
        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        });
        this.s3 = new AWS.S3({region: 'us-east-1'});
        this.bucketName = bucketName;
        this.folder = folder;
    }

    async uploadImage(filename, image){
        await this._upload(filename, this._createBlob(image))
    }

    async uploadText(filename, text) {
        await this._upload(filename, text)
    }

    async delete(filename){
        return this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: this._getKey(filename)
        }).promise();
    }

    async getText(filename){
        const response =  await this.s3.getObject({
            Bucket: this.bucketName, 
            Key: this._getKey(filename)
        }).promise();
        return response.Body.toString("utf-8");
    }

    async getFiles(){
        const result =  await this.s3.listObjects({
            Bucket: this.bucketName, 
            MaxKeys: 1000
          }).promise();
      
        const files = [];
        result.Contents.forEach(content=>{
            let path = '' + content.Key;
            if(this.folder!=''){
                if(path.indexOf(this.folder)==0){
                    const filename = path.substr(this.folder.length + 1)
                    if(filename != '') {
                        files.push(filename)
                    }
                }
            } else{
                files.push(path)
            }
        })
        return files.sort((a,b)=>{
          return (a < b ? 1 : -1);
        });
    }

    async getSignedUrl(key){
        return await this.s3.getSignedUrl('getObject', {
            Bucket: this.bucketName,
            Key: this._getKey(key),
            Expires: 300})
    }

    async _upload(key, body){
        await this.s3.putObject({
            Bucket: this.bucketName,
            Key: this._getKey(key),
            Body: body
          }).promise();
    }

    _getKey(key){
        if(this.folder!=''){
            return this.folder + '/' + key;
        }
        return key;
    }

    _createBlob(src){
        var canvas = document.getElementById("tmpCanvas");
        cv.imshow("tmpCanvas", src);
        var type = 'image/jpeg';
        var dataurl = canvas.toDataURL(type);
        var bin = atob(dataurl.split(',')[1]);
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
          buffer[i] = bin.charCodeAt(i);
        }
        return  new Blob([buffer.buffer], {type: type});
    }
}