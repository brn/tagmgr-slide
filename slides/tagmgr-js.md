name: inverse
class: center,middle,inverse,no-border
# Inside TagManager

## Cyberagent.inc

## brn

---
# javascript for AD

## どこに使われてる?
サンクスページなどに、タグと呼ばれるhtml断片とscriptタグを埋め、  
コンバージョンを記録したり、ユーザーのクッキーに商品を買ったことをマークしたりする。  

例
```html
<!-- CAMP JavaScript Tag -->
<script type="text/javascript" src="http://xxx.xxx/x.js"></script>
<script type="text/javascript">
  createCvTag("1", "1");
</script>
<!-- CAMP JavaScript Tag -->
```

最近は過剰に使われすぎ...

---
# Probrems...
某サイトのタグ

```html
<!-- Start google analytics tag --> 
<script type="text/javascript" src="/xxx.js" charset="utf-8"></script> 
<script type="text/javascript" src="/xxx.js" charset="utf-8"></script> 
<!-- End google analytics tag --> 

<!-- CAMP Onetag --> 
<script type="text/javascript" src="http://xxx.js"></script>
<noscript>
<iframe src="http://xxx" width="1" height="1"></iframe>
</noscript>
<!-- CAMP Onetag --> 

<script type="text/javascript" src="xxx.js"></script> 
<SCRIPT LANGUAGE="JavaScript" type="text/javascript">
document.write('<SCR' + 'IPT language="JavaScript" type="text/javascript"  src="'
+ location.protocol
+ 'xxx.js?random='
+ Math.round(Math.random()*1000000000) + '"></SCR' + 'IPT>');
</SCRIPT>
<NOSCRIPT>
<IFRAME src="https://xxx.php" width="0" height="0" frameborder="0"></IFRAME>
</NOSCRIPT>

<script type="text/javascript">
  (function () {
    var tagjs = document.createElement("script");
    var s = document.getElementsByTagName("script")[0];
    tagjs.async = true;
    tagjs.src = "//s.yjtag.jp/tag.js#site=xxx,xxx,xxx";
    s.parentNode.insertBefore(tagjs, s);
  }());
</script>
<noscript>
  <iframe src="//b.yjtag.jp/iframe?c=xxx,xxx,xxx"
  width="1" height="1" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
</noscript>
```

---
# Probrems...

## 場所がわからない!
どこになんのタグを埋めたかわからなくなる。

--

## タグを変えられない!
そんなに簡単に本番のページはいじれません!

--

# どうする？

---
class: center,middle
# タグマネージャの出番です!

---
# What is TagManager?

タグ管理の煩雑さを解消する。

## なにができるの？
各ページにはタグは埋めない。その代わりタグマネージャのタグだけを埋める。  
各ページに直接埋めていたタグを専用の管理画面に設定する。  
すると、タグマネージャが各タグをロードして実行してくれる。

--

## これで解決?
まだです...  
タグマネージャの実装が問題に...

---
# The implementations of TagManager

## 問題点
* 様々なタグを実行しなければならない。
* そもそもjavascriptだけでなく、html断片を配信しなければならない。
* 広告タグの実装がひどすぎる!
* document.write使いまくり。
* 大文字のタグを使ってたりする。

## 初期の実装
1. 管理画面から入力されたhtmlをエスケープ処理。
2. ひたすらdocument.writeln!!

---
```javascript
document.open();
document.writeln('<sc' + 'ript type="text/javasc' + 'ript">');
document.writeln('var campimg = {util: {}, option: {},'
+ 'i4a : \'\', cv : \'\', param : \'\'};');
document.writeln('');
document.writeln('campimg.protocol = document.location.protocol;');
document.writeln('');
document.writeln('campimg.url = campimg.protocol + "//p.ca-mpr.jp/s";');
document.writeln('');
document.writeln('campimg.util.availableQueryKeyMap = {');
document.writeln('  i4a : \'i4a\',');
document.writeln('  i4sa : \'i4sa\',');
document.writeln('  i4t : \'i4t\',');
document.writeln('  i4v : \'i4v\',');
document.writeln('  i4d : \'i4d\',');
document.writeln('  i4c : \'i4c\'');
document.writeln('};');
document.writeln('');
document.writeln('campimg.util.NOOP = function(){};');
document.writeln('campimg.util.RET_STR = function(){return \'\';};');
document.writeln('');
document.writeln('campimg.util.hasEncodeURIComponent = function() {');
document.writeln('  return typeof (encodeURIComponent) == \'function\';');
document.writeln('};');
document.writeln('');
document.writeln('campimg.util.isInIframe = function() {');
document.writeln('  return document.referrer == parent.location;');
document.writeln('};');
document.writeln('');
document.writeln('campimg.util.getParentQueryString = function() {');
document.writeln('  return top.document.location.search;');
document.writeln('};');
document.writeln('');
...
```

---
class:center,middle
#冗談でしょ?

---
# The implementations of TagManager
## 時は流れ...
非同期にタグを読み込んで実行しよう!  
でもdocument.writeがあると動かない...  
document.writeを上書きしよう!  
あと、タグのエラー率とかも計測できるといいよね!!  

---
class:center,middle
#冗談でしょ?

---
# The implementations of TagManager
## 地獄の始まり
まずは、document.writeをなんとかしよう。  

--

## doucment.writeの再実装
シンプルに書き込まれた文字列をhtmlとしてパースして、
scriptを非同期に呼び出して、htmlはそのまま書きだそう!

--

## うまくいかない!
document.writeって複数に分けられるんだよね...

```javascript
document.writeln('<script type="text/javascript">');
document.writeln('var foo = 100;');
document.writeln('</script>');
```

全部バッファにためて、タグ実行終了時に書きだそう...  
本物とは動作が変わるけどしょうがない...

---
# The implementations of TagManager
## タグの実行時間とか、エラーを検知したい
タグでエラーが起きても画面に影響だしたくないよね。  
エラー率とかほしい。  
実行時間もあるといいよね。  
...

--

## エラー抑制
まずはシンプルにインラインscriptをtry catchしてみる。  
外部からロードされるタグは？

--

## 外部タグの管理
外部タグって、document.writeか、appendChild、insertBeforeのどれかじゃね？  
document.writeは対応したし、じゃあElement.prototype書き換えよう。  
これで、外部からロードされるタグも自分で管理できるぞ!

---
# The implementations of TagManager

## ロード状態管理
* onloadとonerrorでロード失敗を管理
* ただし、IE6-8はonreadystatechangeを使う。
* onreadystatechangeは壊れているので、ロード失敗が分からない。

IEはしょうがない...  
実行時例外は?  
...

--

## 外部タグの例外管理
try catchできないし、どうしよう。  
そうだwindow.onerror!!

---
# The implementations of TagManager
## タグの実行機能
* document.write、Element.prototype.insertBefore、Element.prototype.appendChildは実行する直前に上書きして、実行し終わったら元に戻す。
* インラインタグの場合はtry catchでeval
* ただし、IEはevalが壊れているのでwindow.execScriptで実行
* 外部タグのロードはonloadとonerror、onreadystatechangeで管理
* 外部タグの例外はwindow.onerrorでキャッチ

これで外部のタグは全部支配した。

--

## エラー検知
エラーが起きたら、どのタグでエラーが起きたのか知りたいよね。  
...
document.writeもinsertBeforeもappendChildも、  
どのタグから呼ばれたのかわからない...

---
# The implementations of TagManager
## エラー検知
まず、現在実行中のタグを持っておく。

そして、グローバルな優先度付きキューをもっておき、  
script実行完了時のコールバックを低優先度にする。  
その後、appendChildとかの呼び出しは高優先度にすれば、  
常に親は現在実行中のタグになる。

---
# The implementations of TagManager

## 外部タグの実行順

<img src="images/firing-order.png" class="image" />

---
# The implementations of TagManager
## 実行ルール
あるページでは実行したいんだけど、このページでは実行したくありません!  

あーURLパターンとかでしょ？  
ページ内の文字列とかです!  

ファッ!?

--

## URLによる実行ルール
管理画面からパターンを設定するだけ。  
これは簡単。location.hrefで比較するだけ。

---
# The implementations of TagManager

## ページ内の要素による実行ルール
これはしんどい。  
IE6でも動かさないといけないので、まずはCSS3セレクタが必要。  
textとか属性とか取得したいんだよね。  
あとエンジニア以外も簡単に使えるようにして。  

jQuery...

---
# The implementations of TagManager
## jQueryのロード
jQueryを外部からロードしてくる。  
でもページ中に存在するjQueryと被るとまずいので、  
`noConflict(true)`
でカバー。  
これでいいでしょ!  

ページ中からとってきた値をタグの中で使いたいよね。  
...

---
# The implementations of TagManager
## マクロの実装
口で説明するよりも、コードを見たほうが早い!

--

```html
<script type="text/javascript">
var foo = '${{macro_value}}'
</script>
```

超めんどくせー!  

--

まずサーバ側でhtml断片をパースして、マクロ開始文字${{があれば、そこでhtmlを分割。  
それを最後まで繰り返して、最終的にタグ内で連結

```javascript
'<script type="text/javascript">\nvar foo = \''
+ macro('macro_value')
+  \'\n</script>'
```

これでタグ実行前にマクロの値を連結する。

---
# The implementations of TagManager
## イベントの実装
クリックした時にタグを配信したいです。
...

jQueryのonでタグを実行する。  
イベント自体は管理画面から、どのイベントで配信するのか定義する。  

でもこれってクリックして画面遷移したら、計測失敗しますよね？

リンクをクリックして、ページ遷移する前に確実に計測したいんです!

---
# The implementations of TagManager
## イベントの遅延
html要素(`document.documentElement`)にイベントを設定し、  
先ほどの優先度付きロード機能で、イベントを直列化する。  

<img src="./images/event-firing-order.png" class="image" />


---
# The implementations of TagManager
## イベントの遅延

ここに来るまでに全イベントが発火しているはずなので、ページ内のイベントは気にしないことにする。  
その後、event.preventDefaultでページ遷移を阻止し、  
ユーザーがhtml要素自体に登録したイベントを次々に高優先度で優先度付きキューに突っ込む。  
最後に低優先度でevent.targetなリンクのhrefを取得し、location.hrefに代入する。

<img src="./images/event-firing-order2.png" style="width: 100%;height: 50%;" />

---
# Future...

このように、タグマネージャー自体には複雑な機能が実装されています。  
これで問題は解決したのかと思いきや、  
今度はタグマネージャの下にタグマネージャを紐つける事態に...  
問題は山積みです...

--

# We need
# TagManagerManager

--
やってられるか!

---
# Vendors

<img src="./images/ca-tag-solution-logo.png" />  
http://web.tg-m.jp/

<img src="./images/google-logo.png" />  
http://www.google.co.jp/tagmanager/

<img src="./images/yahoo-tagmanager-logo.png" />  
http://tagmanager.yahoo.co.jp/

<img src="./images/tagknight-logo.png" />  
http://www.tagknight.jp/


---
class:center,middle
#Slides
remarks.js  
http://remarkjs.com/

---
class:center, middle
# 以上です。
### ご清聴ありがとうございました。
