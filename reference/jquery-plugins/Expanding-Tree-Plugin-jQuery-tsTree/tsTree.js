/*
 * JQuery tsTree v0.1.0
 *
 * email: nnsmile526@gmail.com
 * Date: 2017-12-10
 */

(function($){

	function hideRecursion(target)
	{
		$(target).children('li').each(function(){
		    var childTarget = $(this).attr('data-open-ul');
		    $(childTarget).hide();
		    $(this).removeClass('choosen');
		    
		    hideRecursion(childTarget);
		});   
	}	

	function sonsTree(arr,id){
	    var temp = [],lev = 0;
	    var forFn = function(arr, id,lev){
	        for (var i = 0; i < arr.length; i++) {
	            var item = arr[i];
	            if (item.last==id) {
	                item.lev=lev;
	                temp.push(item);
	                forFn(arr,item.id,lev+1);
	            }
	        }
	    };
	    forFn(arr, id,lev);
	    return temp;
	}


	$.fn.tsTree = 
	{
		init:function(obj,data){
		//tsTree main function
			obj.html(
	        '<div id="col-0" class="column am-fl">' + 
	            '<ul id="1">' + 
	                '<li data-open-ul="#1-0" nodeId="*"  layerIndex="0" parentNode="0">ALL</li>' + 
	            '</ul>' + 
	        '</div>'
			);

			var tree = sonsTree(data,0);
			var temp = [];

			var mostLayer = 0;
			for(var i = 0;i < tree.length;i++){	
				var node = tree[i];
				if(node.lev > mostLayer)
				{
					mostLayer = node.lev;
				}	
			}
			mostLayer++;				
			
			for(var i = 1;i <= mostLayer;i++)
			{				
				obj.append('<div id="col-' + i + '" class="column"></div>');
			}	
			
			for(var m = 0;m < mostLayer;m++)
			{	
				var lastNode = new Array();

				var lastNodeNum = 0;

				for(var i=0;i<tree.length;i++){

					var mm = m + 1;
					
					var appendDiv = '#col-' + mm;

					var node = tree[i];

					if(node.lev == m)
					{
						var hasNode = false;
						for(var j = 0;j < lastNode.length;j++)
						{
							if(lastNode[j] == node.last)
							{
								hasNode = true;
							}	
						}
						if(hasNode == false)
						{
							lastNode[lastNodeNum] = node.last;
							lastNodeNum++;
						}
						
					}	
				}
				
				for(var k = 0;k < lastNode.length;k++)
				{	
					$(appendDiv).append('<ul id="' + mm + '-' + k + '" style="display:none;" lastNodeId=' + lastNode[k] + '></ul>')
				}
			}
			
			for(var m = 0;m <= mostLayer;m++)
			{	
				var mm = m + 1;
				
				for(var i=0;i<tree.length;i++)
				{
					var node = tree[i];
					
					var theLayer = '#col-' + mm;
					
					if(node.lev == m)
					{
						for(var n = 0;n < $(theLayer).children('ul').length;n++)
						{
							if($(theLayer).children('ul').eq(n).attr('lastNodeId') == node.last)
							{
								var data_ul = "";
								
								for(var c = 0;c < obj.find('ul').length;c++)
								{
									if(obj.find('ul').eq(c).attr('lastNodeId') == node.id)
									{
										data_ul += '#' + obj.find('ul').eq(c).attr('id');
									}	
								}	
								
								$(theLayer).children('ul').eq(n).append('<li data-open-ul="' + data_ul + '" nodeId="' + node.id + '" layerIndex="' + mm + '" parentNode="' + node.last + '">' + node.name + '</li>');
							}	
						}	
					}	
				}
			}
			
			for(var i = 0; i < obj.find('li').length;i++)
			{
				if(obj.find('li').eq(i).attr('data-open-ul') != "")
				{
					obj.find('li').eq(i).html(obj.find('li').eq(i).text() + '<i class=" page-arrow"></i>');
				}	
			}
			
			layerWidth = 100 / (mostLayer + 1);
			layerWidth += '%';			
			$('.column').css('width',layerWidth);
			
			obj.find('li').click(function(){

				var me = $(this);

			    var target = $(this).attr('data-open-ul');

			    if(!$(this).hasClass('choosen'))
			    {
			        $(target).show(); 
			        $(this).addClass('choosen');
			    }
			    else
			    {
			        $(target).hide();
			        $(this).removeClass('choosen');

			        hideRecursion(target);  

			    }

			    
			    var thisParent = $(this).parent();

			    thisParent.children('li').each(function(){

			        if($(this).attr('data-open-ul') != target)
			        {
			            var otherTarget = $(this).attr('data-open-ul');
			            $(otherTarget).hide();
			            $(this).removeClass('choosen');

			            hideRecursion(otherTarget);


			        }
			        if($(this).attr('data-open-ul') == "")
			        {
			        	if($(me).text() != $(this).text())
			        	{
			        		$(this).removeClass('choosen'); 
			        	}	
			        }
			    });

			});

			var tsTreeTools = {
				getLastNodeId:function(){
					var liList = obj.find('li');
					var thisLayer = 0;

					var lastNode = {
						id:"",
						name:"",
						last:"",
					};

					for(var i = 0; i < liList.length;i++)
					{
						if(liList.eq(i).hasClass('choosen'))
						{
							if(liList.eq(i).attr('layerIndex') > thisLayer)
							{
								lastNode.id = liList.eq(i).attr('nodeid');
								lastNode.name = liList.eq(i).text();
								lastNode.last = liList.eq(i).attr('parentNode');

								thisLayer = liList.eq(i).attr('layerIndex');
							}
							
							$('#cate').append('<li class="am-active">' + liList.eq(i).text() + '</li>');
						}	
						if(liList.eq(i).attr('layerIndex') == 0)
						{
							lastNode.id = "*";
							lastNode.name = "全部";
							lastNode.last = "0";
						}
					}

					return lastNode;	
				},
				getAllSelectedNode:function(){
					var liList = obj.find('li');
					var allSelectedNode = [];

					for(var i = 0;i < liList.length;i++)
					{
						if(liList.eq(i).hasClass('choosen'))
						{
							var singleNode = {
								id:"",
								name:"",
								last:"",
							};

							singleNode.id = liList.eq(i).attr('nodeid');
							singleNode.name = liList.eq(i).text();
							singleNode.last = liList.eq(i).attr('parentNode');

							allSelectedNode.push(singleNode);
						}
						if(liList.eq(i).attr('layerIndex') == 0)
						{
							var singleNode = {
								id:"",
								name:"",
								last:"",
							};

							singleNode.id = "*";
							singleNode.name = "全部";
							singleNode.last = "0";

							allSelectedNode.push(singleNode);
						}	
					}

					return allSelectedNode;	
				},

			};//tsTreetools end

			return tsTreeTools;		
		},
		//other function
		destory:function(){
			//
		},
	};


}(jQuery));

