(function() {
    'use strict';

    //キャンバス
    const CANVAS_WIDTH = 700;
    const CANVAS_HEIGHT = 220;

    //変数宣言
    let canvas = null;
    let ctx = null;
    let scene = null;
    let takazawa = [];
    let powawa = [];
    let dreams = [];
    let ofuton = null;
    let fukidashi = null;
    let chara = null;

    //画像のファイル名をまとめた配列はファイル最後尾に記述

    //シーン関連---------------------------------
    //シーンクラス
    class SceneManager {
        constructor() {
            this.scene = {};
            this.currentScene = '';
            this.frame = -1;
        }

        add(sceneName, updateFunction) {
            this.scene[sceneName] = updateFunction;
        }

        use(sceneName) {
            this.currentScene = sceneName;
            this.frame = 0;
        }

        update() {
            this.frame++;
            this.scene[this.currentScene].call(this);
        }
    }

    //シーン制御の登録
    function sceneSetting() {
        scene.add('routine', function() {
            //if(this.frame > 180) scene.use('routine');
        });

        scene.add('fire', function() {
            if(this.frame > 180) {
                scene.use('routine');
                fukidashi.reset();
                chara.reset();
            }
        });
    }

    //画像関連----------------------------------
    //img部品を取り回すためのクラス
    class imgParts {
        constructor(imgPath) {
            this.width = 0;
            this.height = 0;
            this.ready = false;
            this.image = new Image();
            this.image.addEventListener('load', () => {
                this.width = this.image.naturalWidth;
                this.height = this.image.naturalHeight;
                this.ready = true;
            }, false);
            this.image.src = imgPath;
        }

        draw(x, y) {
            const offsetX = this.width / 2;
            const offsetY = this.height / 2;
            ctx.drawImage(
                this.image,
                x - offsetX,
                y - offsetY,
                this.width,
                this.height
            );
        }
    }

    //おふとん、吹き出し、たかざわじゅんすけなどのオブジェクトの基幹クラス
    class AnimationObject {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.count = -1;
        }

        set(x,y) {
            this.x = x;
            this.y = y;
        }
    }

    //おふとんクラス
    class Ofuton extends AnimationObject {
        constructor() {
            super();
        }

        update() {
            if(scene.currentScene === 'routine') {
                takazawa[0].draw(this.x, this.y);
            } else {
                takazawa[1].draw(this.x, this.y);
            }
        }
    }

    //吹き出しクラス
    class Fukidashi extends AnimationObject {
        constructor() {
            super();
            this.dreamIndex = 0;
        }

        update() {
            //シーン'routine'でなければ何もせずリターン
            if(scene.currentScene !== 'routine') return;
            this.count++;
            //３秒毎にリセット
            if(this.count > 180) this.reset();
            //15フレーム単位で状態遷移
            if(this.count < 15) {
                powawa[1].draw(this.x, this.y);
            } else if(this.count < 30) {
                powawa[2].draw(this.x, this.y);
            } else if(this.count < 45) {
                powawa[3].draw(this.x, this.y);
            } else {
                powawa[0].draw(this.x, this.y);
                if(this.count > 60) dreams[this.dreamIndex].draw(this.x, this.y - 10)
            }
        }

        reset() {
            this.count = -1;
            //表示する夢の抽選
            this.dreamIndex = Math.floor(Math.random() * DREAMS.length);            
        }
    }

    //たかざわじゅんすけクラス
    class Chara extends AnimationObject {
        constructor() {
            super();
            this.type = 0;
        }

        update() {
            //シーン'fire'でなければ何もせずにreturn
            if(scene.currentScene !== 'fire') return;
            this.count++;
            //射出タイプの抽選
            if(this.count === 0) {
                this.type = Math.random() < 0.5 ? 0 : 1;
                console.log(this.type);
            }
            //射出描画
            switch(this.type) {
                case 0:
                    this.x -= 22;
                    takazawa[2].draw(this.x, this.y);    
                    break;
                case 1:
                    if(this.count < 40) {
                        this.x -= (24 - Math.min(this.count, 24));
                        takazawa[2].draw(this.x, this.y);
                    } else {
                        if((this.count % 30) < 15) {
                            takazawa[3].draw(this.x - 72, this.y - 6);
                        } else {
                            takazawa[4].draw(this.x - 72, this.y - 6);
                        }
                    }
                    break;
            }
        }

        reset() {
            this.count = -1;
            this.set(560, 189);
        }
    }



    //ページロード完了
    window.addEventListener('load', () => {
        //キャンバス設定、コンテキスト取得
        canvas = document.getElementById('ofutonCVS');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        ctx = canvas.getContext('2d');

        //初期化
        initialize();

        //画像のロードチェック＞恒常ループ開始
        loadCheck();
    }, false);

    //初期化関数
    function initialize() {
        //シーンインスタンス作成
        scene = new SceneManager();
        //シーン登録
        sceneSetting();
        //imgPartsインスタンスを作成
        //まずたかざわじゅんすけから
        takazawa = TAKAZAWA_JUNSUKE.map(fileName => new imgParts(`./img/${fileName}.png`));
        //吹き出し画像
        powawa = FUKIDASI.map(fileName => new imgParts(`./img/${fileName}.png`));
        //夢（吹き出しの中身）
        dreams = DREAMS.map(fileName => new imgParts(`./img/${fileName}.png`));
        //各アニメーションオブジェクトのインスタンス作成
        ofuton = new Ofuton();
        ofuton.set(590, 189);
        fukidashi = new Fukidashi();
        fukidashi.set(384,88);
        chara = new Chara();
        chara.set(560,189);
    }

    //ロードチェック関数
    function loadCheck() {
        let ready = true;
        takazawa.forEach(img => ready = ready && img.ready);
        powawa.forEach(img => ready = ready && img.ready);
        dreams.forEach(img => ready = ready && img.ready);
        if(ready === true) {
            scene.use('routine');
            eventSetting();
            render();
        } else {
            setTimeout(loadCheck, 100);
        }
    }

    //おふとんに対しクリックイベントを設定
    function eventSetting() {
        canvas.addEventListener('click', (event) => {
            const sceneCheck = scene.currentScene === 'routine';
            const pointerCheck = (event.offsetX > CANVAS_WIDTH * 0.7) && (event.offsetY > CANVAS_HEIGHT * 0.6);
            if(sceneCheck && pointerCheck) scene.use('fire');
        }, false);
    }

    //描画関数（恒常ループでもある）
    function render() {
        ctx.globalAlpha = 1.0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //各アップデート
        scene.update();
        ofuton.update();
        fukidashi.update();
        chara.update();

        //恒常ループ
        requestAnimationFrame(render);
    }

    //画像のファイル名データ
    const TAKAZAWA_JUNSUKE = ['ohuton','ohuton_null','syultu','takazawa1','takazawa2'];
    const FUKIDASI = ['powawa','powawa1','powawa2','powawa3'];
    const DREAMS = [
        'computer_screen_programming',
        'food_curryrice_white',
        'food_karaage_lemon',
        'food_ramen_iekei_uzura',
        'game_syougi',
        'niku_manga',
        'niku_yakiniku',
        'rolling_sushi',
        'nest'
    ];

})();