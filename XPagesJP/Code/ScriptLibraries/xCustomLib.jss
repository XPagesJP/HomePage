// Initialization process for all xpages
function init(){
	try{
		// Get configuration document
		var cView:NotesView = database.getView( "vConfig" );
		var cDoc:NotesDocument  = cView.getFirstDocument();
		
		// Get favicon
		if(sessionScope.containsKey("favicon") == false){
			sessionScope.put("favicon", getAttachmentImageURL(cDoc, "favicon"));
		}
		
		//
		if(sessionScope.containsKey("logoImage") == false){
			sessionScope.put("logoImage", getAttachmentImageURL(cDoc, "logoimage"));
		}
		
		cView.recycle();
		cDoc.recycle();
	}catch(e){
		print(e);
	}
}


var getProfileValue = function(fieldName){
	var retVal = "";
	try{
		var cView = database.getView("vConfig");
		var cDoc  = cView.getFirstDocument();
		retVal = cDoc.getItemValueString(fieldName);
	}catch(e){
		print(e);
	}
	return retVal;
}

/**
 * Get a specific field value after searching the first document from vContsCat view by category
 * @param {NotesView} vw: vContsCat view.
 * @param {String} key: category field value.
 * @param {String} fieldName: document field name.
 * @returns {Vector} field value specified by fieldName.
 */
var getContentValue = function(vw:NotesView, key, fieldName:String){
	var retVal = null;
	try{
		var doc:NotesDocument = vw.getDocumentByKey(key);
		if(doc){
			retVal = doc.getItemValue(fieldName);
		}
	}
	catch(e){
		print(e);
	}
	return retVal;
}

// Get URL of first image file embedded in specific Rich Text field
// param:
// doc: target notes document
// strImgField: rich text field name which contains the embedded image 
function getAttachmentImageURL(doc:NotesDocument, strImgField:String){
	var strRet = "";
	try{
		var rtItem:NotesRichTextItem  = doc.getFirstItem(strImgField);
		if(rtItem !== null){
			var attachmentName = rtItem.getEmbeddedObjects().get(0).getName();	// Get first attachment image
			var webScheme = facesContext.getExternalContext().getRequest().getScheme();
			var webSrvName = facesContext.getExternalContext().getRequest().getServerName();
			var webDbName = facesContext.getExternalContext().getRequest().getContextPath();
			var url = webScheme+"://"+webSrvName+webDbName+"/xsp/.ibmmodres/domino/OpenAttachment/"+webDbName;
			strRet = url+'/'+doc.getUniversalID()+'/'+strImgField+'/'+attachmentName;
			
			rtItem.recycle();
		}
	}catch(e){
		print(e);
	}
	return strRet;
}
