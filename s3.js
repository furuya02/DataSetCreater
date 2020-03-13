class S3 {
    constructor(bucketName){
        // 2020-03-12現在、us-east-1でないと、Rekognition Custom Labelsでデータセットに登録できない
        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxx',
        });
        this.s3 = new AWS.S3({region: 'us-east-1'});
        this.bucketName = bucketName;
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
            Key: filename
        }).promise();
    }

    async getText(filename){
        const response =  await this.s3.getObject({
            Bucket: this.bucketName, 
            Key: filename
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
          files.push(content.Key)
        })
        return files.sort((a,b)=>{
          return (a < b ? 1 : -1);
        });
    }

    async getSignedUrl(key){
        return await this.s3.getSignedUrl('getObject', {
            Bucket: this.bucketName,
            Key: key,
            Expires: 300})
    }

    async _upload(key, body){
        await this.s3.putObject({
            Bucket: this.bucketName,
            Key: key,
            Body: body
          }).promise();
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