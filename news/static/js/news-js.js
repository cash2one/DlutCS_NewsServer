$('.news-link').hover(function(){
	$(this).find('#news-container').css('background-color','rgba(0,0,0,0.1)');
},
function(){
	$(this).find('#news-container').css('background-color','rgba(0,0,0,0)');
});
var current_page=1;
var COMMENTS_PER_PAGE=5;// shoudl be odd,but do not change this value 
var MAX_PAGE_PER_LINE=3;// should be odd
var comments_list=$('#comments_list');
var comments_count=comments_list.attr('data-count');
var PAGE_NUM=Math.ceil(comments_count/COMMENTS_PER_PAGE);

$(function(){
	$('.comment_content').hide();
	var next_page=$('#comments_page_next');

	next_page.before('<li id="page'+1+'" class="active"><a onclick="comments_page_change(1)"><strong>1</strong></a></li>');
	for(var i=2;i<=PAGE_NUM;i++)
	{
		next_page.before('<li id="page'+i+'"><a onclick="comments_page_change('+i+')"><strong>'+i+'</strong></a></li>');
		if(i>MAX_PAGE_PER_LINE)
			$('#page'+i).hide();
	}
	$('.comment').hide();
	show_hide_page(1,'SHOW');
})

function comments_page_change(page)
{
	if(page==current_page)
		return false;
	if(page=='previous')
	{
		if(current_page==1)
			return false;
		page=current_page-1;
	}
	else if(page=='next')
	{
		if(current_page==PAGE_NUM)
			return false;
		page=current_page+1;
	}
	else if(page=='first')
	{
		page=1;
	}
	else if(page=='last')
	{
		page=PAGE_NUM;
	}
	$('#page'+current_page).removeClass('active');
	$('#page'+current_page).addClass('disable');
	$('#page'+page).removeClass('disable');
	$('#page'+page).addClass('active');
	var startPage=current_page-Math.floor(MAX_PAGE_PER_LINE/2);
	startPage=startPage>0?startPage:1;
	var endPage=startPage+MAX_PAGE_PER_LINE-1;
	endPage=endPage>PAGE_NUM?PAGE_NUM:endPage;
	for(var i=startPage;i<=endPage;i++)
		$('#page'+i).hide();

	startPage=page-Math.floor(MAX_PAGE_PER_LINE/2); 
	endPage=page+Math.floor(MAX_PAGE_PER_LINE/2);  
	if(endPage>PAGE_NUM&&startPage>=1)
	{
		//alert('cut tail')
		var tmpStartPage=startPage-(endPage-PAGE_NUM);
		startPage=tmpStartPage>0?tmpStartPage:1;
	}
	else if(endPage<=PAGE_NUM&&startPage<1)
	{
		//alert('cut head');
		var tmpEndPage=endPage+(1-startPage);
		endPage=tmpEndPage<=PAGE_NUM?tmpEndPage:PAGE_NUM;
	}
	else if(endPage>PAGE_NUM&&startPage<1)
	{
		//alert('both cut');
		endPage=PAGE_NUM;
		startPage=1;
	}
	for(var i=startPage;i<=endPage;i++)
		$('#page'+i).show();
	show_hide_page(current_page,'HIDE');
	show_hide_page(page,'SHOW');

	current_page=page;
	return true;
}
function show_hide_page(page,control)
{
	for(var i=COMMENTS_PER_PAGE*(page-1)+1;i<=page*COMMENTS_PER_PAGE;i++)
	{
		var no='#comment_'+i;
		if(control=='HIDE')
			$(no).hide();
		else
			$(no).show();
	}
}
function comment(id)
{	
	var comment=$('#comment_content_'+id);
	var isshow=comment.is(':visible');
	$('.comment_content').hide();
	var no_comments=$('#no_comments');
	if(isshow)
	{
		comment.hide();
		no_comments.fadeIn(250);
		$('#create_a_comment_'+id).html(id==0?'发表评论':'<span class="glyphicon glyphicon-share"></span> 回复');
	}
	else
	{
		no_comments.hide();
		comment.fadeIn(250);
		$('#create_a_comment_'+id).html(id==0?'取消评论':'<span class="glyphicon glyphicon-remove"></span> 取消');
	}
}
function GetCharLength(str) 
{ 
	var iLength = 0; 
	for(var i = 0;i<str.length;i++) 
	{ 
		if(str.charCodeAt(i) >255) 
		{ 
			iLength += 2; 
		} 
		else 
		{ 
			iLength += 1; 
		} 
	} 
	return iLength; 
}
function checkReplyContent(id)
{
	var content_length=GetCharLength($('#comment_input_'+id).val());
	$('#charslabel_'+id).show();
	var counts=120-content_length;
	if(counts>=0)
	{
		$('#charslabel_'+id).html("还可以输入<span style=\"color:green\">"+counts+"</span>字符");
		if(counts<120)
			return true;
		else
			return false;
	}
	else
	{
		$('#charslabel_'+id).html("<span style=\"color:red;\">输入字数超过限制！</span>");
		return false;
	}
}

function submitComment(id)
{
	var content=$("#comment_input_"+id).val();
	if(!checkReplyContent(id))
	{
		alert('请检查输入!');
		return false;
	}
	var reply_to_id=id;
	var news_id=$('#news-container').attr('data-news-id');
	$.get(
		'/news/comment/',
		{
			news_id:news_id,
			reply_to_id:reply_to_id,
			content:content,
		},
		function(reply)
		{
			if(reply=='SUCCESS')
			{
				location.reload();

			}
			else
			{
				alert('评论失败，请检查网络');
			}
		})
}

function voteup(id)
{
	var item=$('#voteup_'+id);
	$.get(
		'/news/voteup/',
		{
			comment_id:id,
		},
		function(reply)
		{
			if(reply!='try FAIL'&&reply!='method FAIL')
			{
				item.html('<span class="glyphicon glyphicon-thumbs-up" ></span> '+reply);
				alert('投票成功!');
				item.attr('disabled','disabled');
			}
			else
			{
				alert('投票失败，请检查网络:'+reply);
			}
		})
}

function querymore()
{
	var amore=$('#more');
	var news_type=amore.attr('data-type');
	var start=amore.attr('data-start');
	$.get(
		'/news/query_more/',
		{
			news_type:news_type,
			start:start,
		},
		function(reply)
		{
			//reply[0].fields.title
			//reply[0].pk
			if(reply!='FAIL')
			{
				if(amore.attr('href'))
					amore.attr('data-start',parseInt(start)+10);
				if(reply.length<10)
				{
					$('#more>div>h3').html('<span class="glyphicon glyphicon-remove"></span> 已无更多...');
					amore.removeAttr('href').attr('disabled',true);
				}
				for(var i=0;i<reply.length;i++)
				{
					var value='<a href="news/?id='+reply[i].pk+'" class="news-link">'+
					'<div id="news-container" class="col-md-12 col-xs-12" style="margin:5px;border: thin solid rgba(0,0,0,0.2);padding:1%;">'+
					'<div class="col-md-2 col-xs-12" style="margin-top:0px;border: thin solid rgba(0,0,0,0.2);padding:1%">'+
					'<img src="/'+reply[i].fields.picture+'" style="width:100%" alt="'+reply[i].fields.picture+'" />'+
					'</div>'+
					'<div class="col-md-10 col-xs-12" style="float:left;margin-left:0px;">'+
					'<h3 style="margin-top:0px">【'+reply[i].fields.news_type+'】'+reply[i].fields.title+'</h3>'+
					'<p style="margin-top:0px">'+reply[i].fields.pub_date+'</p>'+
					'<p style="margin-top:0px">'+reply[i].fields.short_content+'</p>'+
					'<p style="float:right;font-size: 20px;"><span class="label label-primary">阅读量:'+reply[i].fields.views+'次</span>|<span class="label label-primary">评论数:'+reply[i].fields.comments+'次</span></p>'+
					'</div>'+
					'</div>'+
					'</a>';
					amore.before(value);
				}
			}
			else
			{
				alert(reply);
			}
		})
	$('#more>div>h3').html('<span class="glyphicon glyphicon-refresh"></span> 加载中...');
}

$(window).bind("scroll",function() 
{ 
	if ($(document).scrollTop() + $(window).height() > $(document).height()-1) 
	{ 
		querymore();
	} 

})