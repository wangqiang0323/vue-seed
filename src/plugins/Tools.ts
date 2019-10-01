import config from "./config";

export class Tools {
    static asyncLoadScript(url: any, callback: any) {
        let old_script: any = document.getElementById(url);
        if (old_script) {
            if (old_script.ready === true) {
                callback();
                return;
            } else {
                document.body.removeChild(old_script);
            }
        }
        let script: any = document.createElement('script');
        script.src = url;
        script.id = url;
        script.onload = script.onreadystatechange = function () {
            if (script.ready) {
                return false;
            }
            if (!script.readyState
                || script.readyState === "loaded" || script.readyState === 'complete'
            ) {
                script.ready = true;
                callback();
            }
        };
        document.body.appendChild(script);
    }

    static asyncLoadScripts(scripts: any, callback: any) {
        var ok = 0;
        for (var i = 0; i < scripts.length; i++) {
            Tools.asyncLoadScript(scripts[i], function () {
                ok++;
                if (ok === scripts.length) {
                    callback();
                }
            })
        }
    }

    static async getViewToken(obj: any) {

        let header: string = "Basic" + " UTRya2x6VzhjMmJUSWYydFRsS2hrdnNnUzVMVnh3eW06QUVIMGxyTkViTlJLSENha1pxbVg4UWFCZVU3VG9ycnE=";
        let url: string = config.host + ":" + config.map_port + "/oauth2/token";
        let res = await fetch(url, {
            method: "POST",
            headers: {
                'Authorization': header
            },
            body: ''
        });
        let result = await res.json();

        header = "Bearer " + result.data.token;
        if (obj.type === "file") {
            url = config.host + ":" + config.map_port + "/view/token?fileId=" + obj.keys;
        } else if (obj.type === "integrate") {
            url = config.host + ":" + config.map_port + "/view/token?integrateId=" + obj.keys;
        } else if (obj.type === "compare") {
            url = config.host + ":" + config.map_port + "/view/token?compareId=" + obj.keys;
        }
        let res2 = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': header
            },
        })
        let result2 = await res2.json();
        let viewToken = result2.data;
        return viewToken;

    }

    static postRequest(url: string, content: any) {

        let response = fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(content)
        }).then(function (res) {
            if (res.status === 200) {
                return res.json();
            } else {
                return Promise.reject(res.json())
            }
        }).catch(function (err) {
            console.log(err);
        });

        return response;

    }

    static vector_distance(lhs_x: number, lhs_y: number, rhs_x: number, rhs_y: number) {
        var len = (lhs_x - rhs_x) * (lhs_x - rhs_x) + (lhs_y - rhs_y) * (lhs_y - rhs_y);
        return Math.sqrt(len);
    }
}

export default Tools;
