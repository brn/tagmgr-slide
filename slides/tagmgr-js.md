class: center,middle
# 広告業界のタグマネージメントツール

---
class: center,middle
## 株式会社サイバーエージェント CAMP事業部
# @brn

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
# 問題点
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

計測の為にタグを埋め込みまくる

---
# 問題点

## 場所がわからない!
どこになんのタグを埋めたかわからなくなる。

## タグを変えられない!
そんなに簡単に本番のページはいじれません!

# どうする？

---
class: center,middle
# タグマネージャの出番です!

---
# タグマネージャとは？

タグ管理の煩雑さを解消する。

## なにができるの？
各ページにはタグは埋めない。その代わりタグマネージャのタグだけを埋める。  
各ページに直接埋めていたタグを専用の管理画面に設定する。  
すると、タグマネージャが各タグをロードして実行してくれる。

## これで解決?
まだです...  
タグマネージャの実装が問題に...

---
# タグマネージャの実装

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
# タグマネージャの実装
## 時は流れ...
非同期にタグを読み込んで実行しよう!  
でもdocument.writeがあると動かない...  
document.writeを上書きしよう!  
あと、タグのエラー率とかも計測できるといいよね!!  

---
class:center,middle
#冗談でしょ?

---
# タグマネージャの実装
## 地獄の始まり
まずは、document.writeをなんとかしよう。  

## doucment.writeの再実装
シンプルに書き込まれた文字列をhtmlとしてパースして、
scriptを非同期に呼び出して、htmlはそのまま書きだそう!

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
# タグマネージャの実装
## タグの実行時間とか、エラーを検知したい
タグでエラーが起きても画面に影響だしたくないよね。  
エラー率とかほしい。  
実行時間もあるといいよね。  
...

## エラー抑制
まずはシンプルにインラインscriptをtry catchしてみる。  
外部からロードされるタグは？

## 外部タグの管理
外部タグって、document.writeか、appendChild、insertBeforeのどれかじゃね？  
document.writeは対応したし、  
じゃあElement.prototype書き換えよう。  
これで、外部からロードされるタグも自分で管理できるぞ!  

---
# タグマネージャの実装

## ロード状態管理
* onloadとonerrorでロード失敗を管理
* ただし、IE6-8はonreadystatechangeを使う。
* onreadystatechangeは壊れているので、ロード失敗が分からない。

IEはしょうがない...  
実行時例外は?  
...

## 外部タグの例外管理
try catchできないし、どうしよう。  
そうだwindow.onerror!!

---
# タグマネージャの実装
## タグの実行機能
* document.write、Element.prototype.insertBefore、Element.prototype.appendChildは実行する直前に上書きして、実行し終わったら元に戻す。
* インラインタグの場合はtry catchでeval
* 外部タグのロードはonloadとonerror、onreadystatechangeで管理
* 外部タグの例外はwindow.onerrorでキャッチ

これで外部のタグは全部支配した。

## エラー検知
エラーが起きたら、どのタグでエラーが起きたのか知りたいよね。  
...
document.writeもinsertBeforeもappendChildも、  
どのタグから呼ばれたのかわからない...

---
# タグマネージャの実装
## エラー検知
現在実行中のタグを持っておこう。
そして、appendChildとかの呼び出しと、script実行完了コールバックにそれぞれ優先度をつけよう!  
優先度付きキューにコールバック入れて、呼び出し完了までブロックすれば現在の親がわかるじゃん!

---
# タグマネージャの実装
## 実行ルール
あるページでは実行したいんだけど、このページでは実行したくありません!  
あーURLパターンとかでしょ？  
ページ内の文字列とかです!  
ファッ!?

## URLによる実行ルール
管理画面からパターンを設定するだけ。  
これは簡単。location.hrefで比較するだけ。

## ページ内の要素による実行ルール
これはしんどい。  
IE6でも動かさないといけないので、まずはCSS3セレクタが必要。  
最初はsizzleでチャレンジ!!  

textとか属性とか取得したいんだよね。  
あとエンジニア以外も簡単に使えるようにして。  

jQuery...

---
# タグマネージャの実装
## jQueryのロード
jQueryを外部からロードしてくる。  
でもページ中に存在するjQueryと被るとまずいので、  
`noConflict(true)`
でカバー。  
これでいいでしょ!  

script実行タイミングを変えたい。  
DOMContentLoadedだけじゃなくて。  
あと、非同期呼び出しだけじゃなくて同期呼び出しもほしい。  

---
class: center,middle
# いままでのは何だったんだ!

---
# タグマネージャの実装
## 実行タイミング
DOMContentLoadedだけじゃなくて、タグロード完了後すぐに呼び出したい。
