# tsTree
written by syzc.MciaR
jQuery Transverse tree, js tree plugins, jQuery, tree plugins, categorey tree, categorey plugins, multilevel list, expandable list

You just need tsTree.js and tsTree.css in your html.And dont forget the jQuery.min.js!
Actually, if you don't care about the css style, the tsTree.js is enough for you.
This tsTree.css is used in a project of mine, so it may not suit for you, just change it! Hope you make it more beautiful :)

!!!Ps: I'm a noob, so my code is not well, please forgive me if my code brings you more problems.  :) I'm working hard now!
And welcome to commuicate with me, it can make my better !
I will be very happy if you come to me!

Email: nnsmile526@gmail.com

这是一个横向展开树的插件，因为项目需要在网上查了很多未果后所以决定自己写一个，自己代码水平不高所以希望各位多多包涵。有任何可以改进的地方或错误都欢迎指出！（应该有无数可以改进的地方 ：))

你只需要引入tsTree.js和tsTree.css以及jquery.js/jquery.min.js就可以了，暂时对jquery版本无要求，不过建议使用1.6以上版本。
事实上tsTree.css只是一个demo用来示范，完全可以靠你自己来写~
插件很简单希望可以帮助到你们！邮箱留在了上面，随时欢迎联系我！

# Start
## step1: 
js and css<br/>
```
  <link rel="stylesheet" type="text/css" href="tsTree.css">
  <script type="text/javascript" src="jquery-3.2.0.min.js"></script>
  <script type="text/javascript" src="tsTree.js"></script>
  ```
## step2: 
creat a dom <br/>
```
  <div id="categorey"></div>
```
## step3:
data<br/>
```
  var data = [{"id":5,"last":0,"name":"A-1"},{"id":6,"last":0,"name":"A-2"},{"id":7,"last":0,"name":"A-3"}];
  ```
## step4:
init<br/>
```
  var tsTree = $.fn.tsTree.init($('#categorey'),data);
```
# Api
  * tsTree.getLastNodeId()
  ```
    tsTree.getLastNodeId().id // the selected last node id
    tsTree.getLastNodeId().name // the selected last node name
    tsTree.getLastNodeId().last // parent node id
 ```   
  * tsTree.getAllSelectedNode()
  <br/>//return type:array;
  ```
    tsTree.getAllSelectedNode()[i].id // one of all selected node id
    tsTree.getAllSelectedNode()[i].name // one of all selected node name
    tsTree.getAllSelectedNode()[i].last //one of all selected parent node id
   ``` 

