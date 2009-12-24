
function failedMessage(title, content)
{
	$('thebuggenie_failuremessage_title').update(title);
	$('thebuggenie_failuremessage_content').update(content);
	if ($('thebuggenie_successmessage').visible())
	{
		var success_queue = Effect.Queues.get('successmessage');
		success_queue.each(function(effect) { effect.cancel(); });
		new Effect.SlideUp('thebuggenie_successmessage', { queue: { position: 'end', scope: 'successmessage', limit: 2 }, duration: 0.5 });
	}
	if ($('thebuggenie_failuremessage').visible())
	{
		var failed_queue = Effect.Queues.get('failedmessage');
		failed_queue.each(function(effect) { effect.cancel(); });
		new Effect.Pulsate('thebuggenie_failuremessage');
	}
	else
	{
		new Effect.SlideDown('thebuggenie_failuremessage', { queue: { position: 'end', scope: 'failedmessage', limit: 2 }, duration: 1 });
	}
	new Effect.SlideUp('thebuggenie_failuremessage', { queue: { position: 'end', scope: 'failedmessage', limit: 2 }, delay: 30 });
}

function successMessage(title, content)
{
	$('thebuggenie_successmessage_title').update(title);
	$('thebuggenie_successmessage_content').update(content);
	if ($('thebuggenie_failuremessage').visible())
	{
		var failed_queue = Effect.Queues.get('failedmessage');
		failed_queue.each(function(effect) { effect.cancel(); });
		new Effect.SlideUp('thebuggenie_failuremessage', { queue: { position: 'end', scope: 'failedmessage', limit: 2 }, duration: 0.5 });
	}
	if ($('thebuggenie_successmessage').visible())
	{
		var success_queue = Effect.Queues.get('successmessage');
		success_queue.each(function(effect) { effect.cancel(); });
		new Effect.Pulsate('thebuggenie_successmessage');
	}
	else
	{
		new Effect.SlideDown('thebuggenie_successmessage', { queue: { position: 'end', scope: 'successmessage', limit: 2 }, duration: 1 });
	}
	new Effect.SlideUp('thebuggenie_successmessage', { queue: { position: 'end', scope: 'successmessage', limit: 2 }, delay: 10 });
}

function _postFormWithJSONFeedback(url, formname, indicator, hide_div_when_done)
{
	var params = Form.serialize(formname);
	new Ajax.Request(url, {
	asynchronous:true,
	method: "post",
	evalScripts: true,
	parameters: params,
	onLoading: function (transport) {
		$(indicator).show();
	},
	onSuccess: function (transport) {
		var json = transport.responseJSON;
		if (json.failed)
		{
			failedMessage(json.error);
			$(indicator).hide();
		}
		else
		{
			$(indicator).hide();
			successMessage(json.title, json.content);
			if (hide_div_when_done != '' && $(hide_div_when_done))
			{
				$(hide_div_when_done).hide();
			}
		}
	},
	onFailure: function (transport) {
		$(indicator).hide();
		if (transport.responseJSON)
		{
			failedMessage(transport.responseJSON.error);
		}
		else
		{
			failedMessage(transport.responseText);
		}
	}
	});
}

function findIdentifiable(url, field)
{
	var params = Form.serialize(field + '_form');
	new Ajax.Updater(field + '_results', url, {
	asynchronous: true,
	method: "post",
	parameters: params,
	onLoading: function () {$(field + '_spinning').show();},
	onComplete: function () {$(field + '_spinning').hide();}
	});
}

function switchSubmenuTab(visibletab, menu)
{
  $(menu).childElements().each(function(item){item.removeClassName('selected');});
  $(visibletab).addClassName('selected');
  $(menu + '_panes').childElements().each(function(item){item.hide();});
  $(visibletab + '_pane').show();
}

function addSearchFilter(url)
{
	var params = Form.serialize('add_filter_form');
	params += '&key=' + $('max_filters').value;
	new Ajax.Request(url, {
	asynchronous:true,
	method: "post",
	evalScripts: true,
	parameters: params,
	onLoading: function (transport) {
		$('add_filter_indicator').show();
	},
	onSuccess: function (transport) {
		var json = transport.responseJSON;
		if (json.failed)
		{
			failedMessage(json.error);
			$('add_filter_indicator').hide();
		}
		else
		{
			$('add_filter_indicator').hide();
			$('search_filters_list').insert({bottom: json.content});
			$('max_filters').value++;
		}
	},
	onFailure: function (transport) {
		$('add_filter_indicator').hide();
	}
	});
}

function removeSearchFilter(key)
{
	$('filter_' + key).remove();
	if ($('search_filters_list').childElements().size() == 0)
	{
		$('max_filters').value = 0;
	}
}

function showBud(elem_id)
{
	$('bud_' + elem_id).show();
	$('icon_' + elem_id).className = "imgtd_bud_hover";
}

function hideBud(elem_id)
{
	$('bud_' + elem_id).hide();
	$('icon_' + elem_id).className = "imgtd_bud";
}

function updateProfileInformation(url)
{
	_postFormWithJSONFeedback(url, 'profile_information_form', 'profile_save_indicator');
	return true;
}

function updateProfileSettings(url)
{
	_postFormWithJSONFeedback(url, 'profile_settings_form', 'profile_settings_save_indicator');
	if ($('profile_use_gravatar_yes').checked)
	{
		$('gravatar_change').show();
	}
	else
	{
		$('gravatar_change').hide();
	}
	return true;
}

function changePassword(url)
{
	_postFormWithJSONFeedback(url, 'change_password_form', 'change_password_indicator', 'change_password_form');
	return true;
}

function hideInfobox(url, boxkey)
{
	if ($('close_me_' + boxkey).checked)
	{
		new Ajax.Request(url, {
		asynchronous:true,
		method: "post",
		onLoading: function (transport) {
			$('infobox_' + boxkey + '_indicator').show();
		},
		onComplete: function (transport) {
			$('infobox_' + boxkey + '_indicator').hide();
		}
		});
	}
	$('infobox_' + boxkey).fade();
}

function updateProjectMenuStrip(url, project_id)
{
	new Ajax.Updater('project_menustrip', url, {
		asynchronous: true,
		parameters: {project_id: project_id},
		evalScripts: true,
		method: "post",
		onLoading: function(transport) {
			$('project_menustrip_change').hide();
			$('project_menustrip_indicator').show();
			$('project_menustrip_name').hide();
		},
		onComplete: function(transport) {
			$('project_menustrip_indicator').hide();
			$('project_menustrip_name').show();
		}				
	});
}

function searchPage(url, offset)
{
	var params = Form.serialize('find_issues_form');
	params += '&offset=' + offset;
	new Ajax.Updater('search_results', url, {
	asynchronous: true,
	method: "post",
	parameters: params,
	onLoading: function () {$('paging_spinning').show();},
	onComplete: function () {$('paging_spinning').hide();}
	});
}

tinyMCE.init({
	theme : "advanced",
	mode : "none",
	plugins : "inlinepopups,safari",
	convert_fonts_to_spans : false,
	inline_styles : false,
	valid_elements : "a[href|target=_blank],b/strong,i/em,u/span,p,font[color],blockquote,code,ul,ol,li,br",
	theme_advanced_buttons1 : "bold,italic,underline,forecolor,|,bullist,numlist,blockquote,code,|,undo,redo,|,link,unlink",
	theme_advanced_buttons2 : "",
	theme_advanced_buttons3 : "",
	theme_advanced_toolbar_location : "bottom",
	theme_advanced_toolbar_align : "left",
	entity_encoding : "raw",
	body_class: "tinymce_body",
	add_unload_trigger : false,
	remove_linebreaks : false
});

function getUserStateList()
{
	new Ajax.Updater('user_statelist', 'ajax_handler.php?getuserstatelist=true', {
	asynchronous:true,
	method: "post"
	});
}

function setUserState(sid)
{
	new Ajax.Request('ajax_handler.php?getuserstatelist=true', {
	asynchronous:true,
	method: "post",
	parameters: {setuserstate: sid}
	});
}

function setEmailPrivacy(priv)
{
	new Ajax.Updater('account_email', 'ajax_handler.php?setemailprivacy=true', {
	asynchronous:true,
	method: "post",
	parameters: {setting: priv}
	});
}

function showFollowUps(priv)
{
	new Ajax.Updater('account_followups', 'ajax_handler.php?showfollowups=true', {
	asynchronous:true,
	method: "post",
	parameters: {setting: priv}
	});
}

function showAssigned(priv)
{
	new Ajax.Updater('account_showassigned', 'ajax_handler.php?showassigned=true', {
	asynchronous:true,
	method: "post",
	parameters: {setting: priv}
	});
}

function submitNewPassword()
{
	var params = Form.serialize('changepassword_form');
	new Ajax.Updater('password_changed_span', 'ajax_handler.php?change_password=true', {
	asynchronous:true,
	method: "post",
	parameters: params,
	evalScripts: true
	});
	Element.show('password_changed_span');
}

function addFriend(uname, rndno, u_id)
{
	new Ajax.Updater('friends_message_' + uname + '_' + rndno, 'ajax_handler.php?addfriend=true', {
	asynchronous:true,
	method: "post",
	parameters: {uid: u_id},
	onSuccess: function (addFriendSuccess) {
		new Ajax.Updater('friends_link_' + uname + '_' + rndno, 'ajax_handler.php?getfriendlink=true', {
		asynchronous:true,
		method: "get",
		parameters: {uid: u_id, rnd_no: rndno}
		});
	}
	});
}

function removeFriend(uname, rndno, u_id)
{
	new Ajax.Updater('friends_message_' + uname + '_' + rndno, 'ajax_handler.php?removefriend=true', {
	asynchronous:true,
	method: "post",
	parameters: {uid: u_id},
	onSuccess: function (addFriendSuccess) {
		new Ajax.Updater('friends_link_' + uname + '_' + rndno, 'ajax_handler.php?getfriendlink=true', {
		asynchronous:true,
		method: "get",
		parameters: {uid: u_id, rnd_no: rndno}
		});
	}
	});
}

function addComment(modl, t_type, t_id)
{
	tinyMCE.triggerSave();
	var params = Form.serialize('new_comment_form_' + modl + '_' + t_type + '_' + t_id);
	new Ajax.Request('ajax_handler.php', {
	asynchronous: true,
	method: "post",
	parameters: params,
	onSuccess: function (something) {
		getComments(modl, t_type, t_id);
		Form.reset('new_comment_form_' + modl + '_' + t_type + '_' + t_id);
		Element.hide('addComment_' + modl + '_' + t_type + '_' + t_id);
		Element.show('addCommentLink_' + modl + '_' + t_type + '_' + t_id);
	},
	onFailure: function (somethingelse) {
		alert('Your comment could not be added. Please try again.');
	}
	});
}
function getComments(modl, t_type, t_id)
{
	new Ajax.Updater('comments_span_' + modl + '_' + t_type + '_' + t_id, 'ajax_handler.php?getcomments=true', {
	asynchronous:true,
	method: "post",
	evalScripts: true,
	parameters: {target_id: t_id, target_type: t_type, module: modl},
	insertion: Insertion.Top
	});
}

function editComment(cid, modl, t_type, t_id)
{
	new Ajax.Updater('comment_' + cid, 'ajax_handler.php?edit_comment=true', {
	asynchronous:true,
	method: "post",
	evalScripts: true,
	parameters: {comment_id: cid, target_id: t_id, target_type: t_type, module: modl}});
}

function getComment(cid, modl, t_type, t_id)
{
	new Ajax.Updater('comment_' + cid, 'ajax_handler.php?get_comment=true', {
	asynchronous:true,
	method: "post",
	evalScripts: true,
	parameters: {comment_id: cid, target_id: t_id, target_type: t_type, module: modl}});
}

function updateComment(cid, modl, t_type, t_id)
{
	tinyMCE.triggerSave();
	var params = Form.serialize('edit_comment_form_' + modl + '_' + t_type + '_' + t_id);
	new Ajax.Updater('comment_' + cid, 'ajax_handler.php?update_comment=true&comment_id=' + cid + '&target_id=' + t_id + '&target_type=' + t_type + '&module=' + modl, {
	asynchronous:true,
	method: "post",
	evalScripts: true,
	parameters: params,
	onSuccess: function (something) {
		tinyMCE.execCommand('mceRemoveControl', false, 'new_comment_comment_' + modl + '_' + t_type + '_' + t_id);
	},
	onFailure: function (somethingelse) {
		alert('Your comment could not be updated. Please try again.');
	}	
	});
}

function deleteComment(cid, modl, t_type, t_id)
{
	new Ajax.Request('ajax_handler.php?delete_comment=true', {
	asynchronous:true,
	method: "post",
	evalScripts: true,
	parameters: {comment_id: cid, target_id: t_id, target_type: t_type, module: modl}});
	Element.hide('commentheader_' + cid);
	Element.hide('commentbody_' + cid);
	Element.show('deletedcomment_' + cid);
}
