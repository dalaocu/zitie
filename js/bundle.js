(function() {
    'use strict';

    class Config {
        static FontName = "1";
        static fonts = ["", "楷体", "阿里妈妈东方大楷 Regular", "Kaiti SC", "Microsoft YaHei"];
        static Title = "自定义字帖";
        static Content = "使用设置功能自定义内容";
        static ModelType = "1";
        static ZgType = "1";
        static ZgColor = "1";
        static FontTransparent = "1";
        static FontColor = `rgba(224, 6, 6)`;

        static GetFontColor() {
            return `rgba(${Config.FontColor}, ${Config.FontTransparent})`;
        }

        static saveToStorage() {
            window.localStorage.setItem("ModelType", Config.ModelType);
            window.localStorage.setItem("FontName", Config.FontName);
            window.localStorage.setItem("Title", Config.Title);
            window.localStorage.setItem("Content", Config.Content);
            window.localStorage.setItem("ZgColor", Config.ZgColor);
            window.localStorage.setItem("FontTransparent", Config.FontTransparent);
            window.localStorage.setItem("FontColor", Config.FontColor);
        }

        static loadFromStorage() {
            Config.ModelType = window.localStorage.getItem("ModelType") || Config.ModelType;
            Config.FontName = window.localStorage.getItem("FontName") || Config.FontName;
            Config.Title = window.localStorage.getItem("Title") || Config.Title;
            Config.Content = window.localStorage.getItem("Content") || Config.Content;
            Config.ZgType = window.localStorage.getItem("ZgType") || Config.ZgType;
            Config.ZgColor = window.localStorage.getItem("ZgColor") || Config.ZgColor;
            Config.FontTransparent = window.localStorage.getItem("FontTransparent") || Config.FontTransparent;
            Config.FontColor = window.localStorage.getItem("FontColor") || Config.FontColor;
        }
    }

    class SettingPage {
        divSetting;
        divOverlay;
        divContent;
        mySlider;

        constructor() {
            this.divSetting = document.getElementById("setting");
            this.btnSetting = this.divSetting.querySelector("#btnSetting");
            this.divOverlay = this.divSetting.querySelector("#overlay");
            this.divContent = this.divSetting.querySelector("#content");

            this.divOverlay.style.display = "block";

            this.btnSetting.onclick = this.onShowOverlay.bind(this);
            this.divOverlay.onclick = this.onHideOverlay.bind(this);

            this.mySlider = new Slider("#mhColor", {
                // initial options object
                tooltip: 'show',
                min: 0,
                max: 1,
                step: 0.1,
                value: 0.5,
                formatter: function(value) {
                    if (value == 0) {
                        return "无" + value
                    } else if (value == 0.2) {
                        return "浅" + value
                    } else if (value == 0.5) {
                        return "适中" + value
                    } else if (value == 0.9) {
                        return "深" + value
                    } else if (value == 1) {
                        return "很深" + value
                    } else {
                        return "深度" + value;
                    }
                }
            });
            this.mySlider.on("change", function(event) {
                this.onSettingComfirmed(false);
            }.bind(this));

            document.getElementById("btnConfirm").onclick = this.onSettingComfirmed.bind(this);
        }

        onShowOverlay(event) {
            this.divOverlay.style.display = "block";
            this.btnSetting.style.display = "none";
        }

        onHideOverlay(event) {
            if (!this.divContent.contains(event.target)) {
                this.divOverlay.style.display = "none";
                this.btnSetting.style.display = "block";
            }
        }

        onSettingComfirmed(hide = true) {
            this.onUpdateConfig();
            Config.saveToStorage();

            window.main.printPage.onSettingComfirmed();
            if (hide) {
                this.divOverlay.style.display = "none";
                this.btnSetting.style.display = "block";
            }
        }


        getOptionElementValue(eleName) {
            let elements = document.getElementsByName(eleName);
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].checked == true) {
                    return elements[i].value;
                }
            }
        }

        onUpdateConfig() {
            Config.Content = document.getElementById("inputContent").value;
            Config.Title = document.getElementById("inputTitle").value;
            Config.ModelType = (this.getOptionElementValue("modelType"));
            Config.ZgType = (this.getOptionElementValue("zgType"));
            Config.ZgColor = (this.getOptionElementValue("zgColor"));
            Config.FontName = (this.getOptionElementValue("fontName"));
            Config.FontColor = (this.getOptionElementValue("fontColor"));
            Config.FontTransparent = this.mySlider.getValue();
        }
    }

    class PrintPage {
        btnSetting;
        constructor() {

        }

        isChinese(temp) {
            var re = /[^\u4E00-\u9FA5]/;
            if (re.test(temp)) return false;
            return true;
        }

        onSettingComfirmed() {
            let inputContent = Config.Content;
            let ulPrintContent = document.getElementById("printContent");
            ulPrintContent.innerHTML = '';
            let title = document.createElement('h1');
            title.textContent=Config.Title;
            title.style.setProperty("text-align", "center");

            ulPrintContent.appendChild(title);
            // console.log(inputContent);
            $(document).attr("title",Config.Title);

            for (let i = 0; i < inputContent.length; i++) {
                let curChar = inputContent[i];
                if (!this.isChinese(curChar)) {
                    continue;
                }
               this.renderLine(ulPrintContent, curChar);
            }

        }

        renderLine(target, strokes) {
            if(Config.ModelType=="1"){
                this.normalLine(target, strokes);
            }
            else if(Config.ModelType=="2"){
                this.dualLine(target, strokes);
            }
            else if(Config.ModelType=="3"){
                this.partLine(target, strokes);
            }
            else {
                this.normalLine(target, strokes);
            }
        }

        normalLine(ulPrintContent, curChar){
            this.addTeachLine(ulPrintContent, curChar);
            this.addHanziLine(ulPrintContent, curChar);
        }

        dualLine(ulPrintContent, curChar){
            this.addTeachLine(ulPrintContent, curChar);
            this.addHanziLine(ulPrintContent, curChar);
            this.addEmptyHanziLine(ulPrintContent, curChar);
        }

        partLine(ulPrintContent, curChar){
            this.addTeachLine(ulPrintContent, curChar);
            this.add3HZLine(ulPrintContent, curChar);
        }


        renderFanningStrokes(target, strokes) {
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.width = '25';
            svg.style.height = '25';
            // svg.style.border = '1px solid #EEE'
            // svg.style.marginRight = '3px'
            target.appendChild(svg);
            var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // set the transform property on the g element so the character renders at 75x75
            var transformData = HanziWriter.getScalingTransform(25, 25);
            group.setAttributeNS(null, 'transform', transformData.transform);
            svg.appendChild(group);

            strokes.forEach(function(strokePath) {
                var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttributeNS(null, 'd', strokePath);
                path.setAttribute('stroke-width', "0");
                // style the character paths
                path.style = 'fill:rgb(152,15,41);stroke:rgb(152,15,41);';
                group.appendChild(path);
            }.bind(this));
        }

        addTeachLine(ulPrintContent, curChar) {
            let liTeach = document.createElement('li');
            liTeach.className = 'teach-line';
            liTeach.style.cssText = "background: url(img/xb" + Config.ZgColor + ".svg) left center repeat-x;";

            let liTeachHz = document.createElement('span');
            liTeachHz.className = 'teach-line-hz';
            liTeachHz.textContent = curChar;

            let liTeachPy = document.createElement('span');
            liTeachPy.className = 'teach-line-py';
            liTeachPy.textContent = pinyinUtil.getPinyin(curChar, ' ', true, false);
            liTeach.appendChild(liTeachHz);
            liTeach.appendChild(liTeachPy);

            HanziWriter.loadCharacterData(curChar).then(function(charData) {
                // console.log(charData);

                for (var i = 0; i < charData.strokes.length; i++) {
                    let liTeachBs = document.createElement('span');
                    liTeachBs.className = 'teach-line-bs';
                    liTeach.appendChild(liTeachBs);
                    var strokesPortion = charData.strokes.slice(0, i + 1);
                    this.renderFanningStrokes(liTeachBs, strokesPortion);
                }
            }.bind(this));

            ulPrintContent.append(liTeach)
        }

        addHanziLine(ulPrintContent, curChar) {
            let hzLine = document.createElement("li");
            hzLine.className = 'hz-line';
            for (let n = 0; n < 12; ++n) {
                let hzSpan = document.createElement("span");
                hzSpan.innerText = curChar;
                hzSpan.style.cssText = "background: url(img/bg" + Config.ZgType + Config.ZgColor + ".svg); ";
                hzSpan.style.setProperty("color", Config.GetFontColor());
                console.log(Config.FontName);
                console.log(Config.fonts[Config.FontName]);
                hzSpan.style.setProperty("font-family", Config.fonts[Config.FontName] );
                hzLine.appendChild(hzSpan)
            }
            ulPrintContent.appendChild(hzLine)
        }

        add3HZLine(ulPrintContent, curChar) {
            let hzLine = document.createElement("li");
            hzLine.className = 'hz-line';
            for (let n = 0; n < 12; ++n) {
                let hzSpan = document.createElement("div");
                hzSpan.style.cssText = "background: url(img/bg" + Config.ZgType + Config.ZgColor + ".svg); ";
                hzSpan.style.setProperty("color", Config.GetFontColor());
                hzSpan.style.setProperty("font-family", Config.fonts[Config.FontName] );
                if(n < 3) {
                    hzSpan.innerText = curChar;
                } else {
                    hzSpan.innerText = "";
                }
                hzLine.appendChild(hzSpan)
            }
            ulPrintContent.appendChild(hzLine)
        }

        addEmptyHanziLine(ulPrintContent, curChar) {
            let emptyLine = document.createElement("li");
            emptyLine.className = 'hz-line';
            for (let n = 0; n < 12; ++n) {
                let hzSpan = document.createElement("span");
                hzSpan.style.cssText = "background: url(img/bg" + Config.ZgType + Config.ZgColor + ".svg); ";
                emptyLine.appendChild(hzSpan)
            }
            ulPrintContent.appendChild(emptyLine)
        }
    }

    class Main {
        settingPage;
        printPage;

        constructor() {
            this.printPage = new PrintPage();
            this.settingPage = new SettingPage();
        }

        setOptionChecked(optionName, value) {
            let ops = document.getElementsByName(optionName);
            ops.forEach(item => {
                if (item.value == value) {
                    item.setAttribute("checked", "");
                } else {
                    item.removeAttribute("checked");
                }
            });
        }
    }

    window.onload = (event) => {
        console.log("on page loaded");
        Config.loadFromStorage();
        window.main = new Main();
        window.main.setOptionChecked("modelType", Config.ModelType || 1);
        window.main.setOptionChecked("zgType", Config.ZgType || 1);
        window.main.setOptionChecked("zgColor", Config.ZgColor || 1);
        window.main.setOptionChecked("fontColor", Config.FontColor || "#FFB8B8");
        window.main.setOptionChecked("fontName", Config.FontName || 1);
        window.main.setOptionChecked("mhColor", Config.FontTransparent || "0.3");
        window.main.settingPage.onUpdateConfig();
        window.main.printPage.onSettingComfirmed();
        // slider = $("#mhColor").slider()
    };
}());