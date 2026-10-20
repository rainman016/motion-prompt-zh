<!-- tools/build.mjs が meta.json から作ったファイルです。直すときは meta.json を編集してください。 -->

# モーショングラフィックスの演出 第2弾

24 個の名前 · #121–144 · パック `motion2` · 言語: [English](README.md) / [简体中文](README.zh-Hans.md)

名前を見つけたら、そのままAIに伝えてください。「何秒で」「どのくらい強く」「何が動くか」を添えると、思った通りに近づきます。

![モーショングラフィックスの演出 第2弾 — 見本](../../assets/preview-motion2.gif)

## 動きのテクニック

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#121](https://rainman016.github.io/motion-prompt-zh/#121) | **アンティシペーション** | Anticipation | 動く前に逆へ少し溜める | ボタンが右へ飛び出す前にアンティシペーションを入れて。0.3秒かけて逆へ少し引き、つぶれてから出す。 |
| [#122](https://rainman016.github.io/motion-prompt-zh/#122) | **フォロースルー** | Follow-through | 止まった後も一部が遅れて揺れる | キャラが止まったあと、髪と旗にフォロースルーを入れて。0.5秒くらい遅れて揺れて収まるように。 |
| [#123](https://rainman016.github.io/motion-prompt-zh/#123) | **バウンス** | Bounce | 落ちて弾みながら止まる | ボールを上から落としてバウンスさせて。3回弾んで、だんだん低く。 |
| [#124](https://rainman016.github.io/motion-prompt-zh/#124) | **ウィグル** | Wiggle | 小刻みにランダムに揺れる | 通知のベルに弱めのウィグルを付けて。角度は最大10°くらいで、鳴っている間ずっと。 |
| [#125](https://rainman016.github.io/motion-prompt-zh/#125) | **パルス** | Pulse | 鼓動のように大きさが脈打つ | ハートのアイコンをパルスさせて。1.2秒ごとに、10%ほど大きくなって戻る。 |
| [#126](https://rainman016.github.io/motion-prompt-zh/#126) | **モーションパス** | Motion path | 決めた曲線に沿って動く | 紙飛行機を、この曲線のモーションパスに沿って4秒で飛ばして。向きは進む方向に合わせて。 |
| [#127](https://rainman016.github.io/motion-prompt-zh/#127) | **ピンポンループ** | Ping-pong loop | 行って戻るを繰り返す | ローディングの点をピンポンループで左右に往復させて。片道1秒で。 |
| [#128](https://rainman016.github.io/motion-prompt-zh/#128) | **ストップモーション風** | Stop-motion style | コマを落としてカクカク動かす | この動きをストップモーション風にして。1秒8コマで、コマごとに少しだけ位置をぶらして。 |

## 文字・図形の演出

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#129](https://rainman016.github.io/motion-prompt-zh/#129) | **テキストスクランブル** | Text scramble | 文字がランダムに入れ替わってから決まる | 見出しをテキストスクランブルで出して。ランダムな文字が1秒ほど入れ替わって、左から順に決まる。 |
| [#130](https://rainman016.github.io/motion-prompt-zh/#130) | **ウェーブテキスト** | Wave text | 文字が波のように順に上下する | ロゴの文字をウェーブテキストで動かして。1文字ずつずらして、上下20pxくらい。 |
| [#131](https://rainman016.github.io/motion-prompt-zh/#131) | **テキストオンパス** | Text on a path | 文字が線に沿って流れる | キャッチコピーをテキストオンパスで、波線に沿って左から右へ流して。1周5秒で。 |
| [#132](https://rainman016.github.io/motion-prompt-zh/#132) | **可変フォントアニメーション** | Variable font animation | 文字の太さがなめらかに変わる | タイトルを可変フォントアニメーションで、細字から極太へ1秒で変えて。 |
| [#133](https://rainman016.github.io/motion-prompt-zh/#133) | **テキストマスク** | Text mask | 文字の形にくり抜いて中の柄を見せる | 「OCEAN」の文字をテキストマスクにして、中に波の映像を見せて。最後の1秒で外側も見せる。 |
| [#134](https://rainman016.github.io/motion-prompt-zh/#134) | **リピーター** | Repeater | 図形を複製して並べて回す | この花びらの形をリピーターで12枚、円に並べて、4秒で1回転させて。 |
| [#135](https://rainman016.github.io/motion-prompt-zh/#135) | **カレイドスコープ** | Kaleidoscope | 万華鏡のように対称に広がる | ロゴの背景にカレイドスコープを入れて。8分割の対称で、ゆっくり回しながら広げて。 |
| [#136](https://rainman016.github.io/motion-prompt-zh/#136) | **ラインボイル** | Line boil | 手描きの線が小刻みに揺らぐ | 手描きのイラストにラインボイルを付けて。1秒10コマで、線を2〜3pxだけ揺らして。 |

## 切り替え・見せ場

| 番号 | 名前 | 英語名 | ひとこと | AIへの頼み方の例 |
|---|---|---|---|---|
| [#137](https://rainman016.github.io/motion-prompt-zh/#137) | **プッシュ** | Push transition | 次の画面が前の画面を押し出す | 次のスライドへはプッシュで。右から0.8秒で押し出すように。 |
| [#138](https://rainman016.github.io/motion-prompt-zh/#138) | **ブラインド** | Blinds transition | 細い帯の隙間から次の画面が開く | 場面の切り替えをブラインドで。横の帯7本で、1秒かけて開くように。 |
| [#139](https://rainman016.github.io/motion-prompt-zh/#139) | **キューブ** | Cube transition | 立方体が回るように面が替わる | 商品写真の切り替えをキューブで。左へ90°回して、0.8秒で。 |
| [#140](https://rainman016.github.io/motion-prompt-zh/#140) | **ページめくり** | Page curl | 紙のようにめくれて次へ | 次の章へはページめくりで。右下の角から1.2秒でめくって。 |
| [#141](https://rainman016.github.io/motion-prompt-zh/#141) | **ピクセレート** | Pixelate | モザイクが粗くなって切り替わる | ピクセレートで切り替えて。0.6秒でモザイクが粗くなり、いちばん粗いところで次の画面へ。 |
| [#142](https://rainman016.github.io/motion-prompt-zh/#142) | **ガラス割れ** | Shatter | ガラスのように割れて破片が飛ぶ | タイトルの登場前に、前の画面をガラス割れで砕いて。ひびが入ってから破片が1秒で落ちるように。 |
| [#143](https://rainman016.github.io/motion-prompt-zh/#143) | **分解図** | Exploded view | 部品がばらけて中の構造を見せる | 製品の分解図を見せて。4つの部品が1秒でばらけて、名前のラベルを付けて。 |
| [#144](https://rainman016.github.io/motion-prompt-zh/#144) | **スプリットスクリーン** | Split screen | 画面を分けて同時に見せる | スプリットスクリーンで3つの場面を同時に見せて。1画面から2分割、3分割へ0.5秒ずつで。 |

番号を押すと、ギャラリーの動く見本が開きます。1つの名前の秒数・イージングの数値・参考コード: `api/v1/ja/e/<id>.txt` ([#121](../../api/v1/ja/e/121.txt)).

[パックの一覧](../README.md)
