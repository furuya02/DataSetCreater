class Manifest {
    constructor(budketName){
        this.budketName = budketName;
        this.list = null;
    }

    async init(s3){
        this.list = '';
        const files = await s3.getFiles();
        await Promise.all(files.map( async file => {
            if(file.indexOf('L_') === 0){
                const filename = file.replace("L_","").replace(".jpg","") + ".json";
                console.log(`filename:${filename}`)
                const json = await s3.getText(filename);
                if(json && json != ""){
                    this.list += json + '\n';
                }
            }
        }))
    }

    async append(filename, img_width, img_height, labelName, detected, s3){
        // 画像に対するManifestの作成・保存
        const text = this._create('L_' + filename + '.jpg', img_width, img_height, labelName, detected);
        await s3.uploadText(filename + '.json', text);

        // まとめたManifestの作成・保存
        this.list += text + '\n'
        await s3.uploadText('manifest', this.list);
    }

    _create(img_name, img_width, img_height, labelName, detected) {
        
        const annotations = []
        detected.forEach(item => {
            const p1 = item[0];
            const p2 = item[1];
            annotations.push(
                {
                    "class_id": 0,
                    "width": p2.x - p1.x,
                    "top": p1.y,
                    "height": p2.y - p1.y,
                    "left": p1.x
                }
            )
        });

        const json = {
            "source-ref": `s3://${this.budketName}/${img_name}`,
            "boxlabel": {
                "annotations": annotations,
                "image_size": [
                    {
                        "width": img_width,
                        "depth": 3,
                        "height": img_height
                    }
                ]
            },
            "boxlabel-metadata": {
                "job-name": "labeling-job/test-2020-03-10-001",
                "class-map": {
                    "0": labelName
                },
                "human-annotated": "yes",
                "objects": [
                    {
                        "confidence": 1
                    }
                ],
                "creation-date": "2020-03-10T01:55:01.598533",
                "type": "groundtruth/object-detection"
            }
        }
        return JSON.stringify(json);
    }
}
