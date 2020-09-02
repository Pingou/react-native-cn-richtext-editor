const editorHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>
        html {
            height: 100%;
            width: 100%;
        }
        body {
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            height: 100%;
            margin: 0;
            padding: 8px;
            color:#555;
        }
        code { 
            font-family: monospace;
            background-color: #eee;
            background: hsl(220, 80%, 90%); 
           
        }
        pre {
            white-space: pre-wrap;
            background: #eee;
            margin: 5px;
            padding: 5px;      
            word-wrap: break-word;
        }
        
        #editor {
           flex-grow: 1;
        }

        #editor:focus {
          outline: 0px solid transparent;
        }
        
      [contenteditable][placeholder]:empty:before {
        content: attr(placeholder);
        position: absolute;
        opacity: .4;
        background-color: transparent;
      }
    </style>
    <style>
    /* PUT YOUR STYLE HERE */
    </style>
    <title>CN-Editor</title>
</head>
<body oncopy="return false" oncut="return false" onpaste="return false" >
  <div id="editor" contenteditable spellcheck=false autocorrect="off" autocomplete="off" oninput="if(this.innerHTML.trim()==='<br>')this.innerHTML=''" ></div>
    <script>

       

        (function(doc) {


            var editor = document.getElementById('editor');


            editor.contentEditable = true;

            var lastRange = null

            var getSelectedStyles = function() {
                let styles = [];
                document.queryCommandState('bold') && styles.push('bold');
                document.queryCommandState('italic') && styles.push('italic');
                document.queryCommandState('underline') && styles.push('underline');
                document.queryCommandState('strikeThrough') && styles.push('lineThrough');

                var fColor = document.queryCommandValue('foreColor');
                var bgColor = document.queryCommandValue('backColor');
                var colors = {
                        color: fColor,
                        highlight: bgColor
                    };
                var stylesJson = JSON.stringify({
                    type: 'selectedStyles',
                    data: {styles, colors}});
                    sendMessage(stylesJson);
                

            }

             var getNodeIndex = function(n){var i=0;while(n=n.previousSibling)i++;return i}


             /*setTimeout(() =>
              {
               var btns = document.getElementsByClassName('btn')

               for (var i = 0; i < btns.length; i++) {
                    var btn = btns[i]

                    btn.addEventListener("click", function() {
                        let contentChanged = JSON.stringify({
                            type: 'selectedTag',
                            data: 'btn' + i });
                        sendMessage(contentChanged);
                    }, false)
                }

         
               }


           , 3000)*/

           var getRange = function(message) {
                var range=window.getSelection().getRangeAt(0);


                var sC=range.startContainer,eC=range.endContainer;

                A=[];while(sC!==editor){A.push(getNodeIndex(sC));sC=sC.parentNode}
                B=[];while(eC!==editor){B.push(getNodeIndex(eC));eC=eC.parentNode}


                lastRange = {"sC":A,"sO":range.startOffset,"eC":B,"eO":range.endOffset}

                return lastRange
            }



            var sendMessage = function(message) {
              if(window.ReactNativeWebView)
                window.ReactNativeWebView.postMessage(message);
            }


            var getSelectedTag = function() {


               // alert(document.queryCommandValue('foreColor'))

                var range = getRange()

                var obj = {range: range, color: document.queryCommandValue('foreColor'), text: document.getElementById("editor").innerHTML}





                var stylesJson = JSON.stringify({
                type: 'selectedColor',
                data: obj//document.queryCommandValue('foreColor')
                });
                sendMessage(stylesJson);
                
                
                
                

                let tag = document.queryCommandValue('formatBlock');
                if(document.queryCommandState('insertUnorderedList'))
                    tag = 'ul';
                else if(document.queryCommandState('insertorderedlist'))
                    tag = 'ol';
                switch (tag) {
                    case 'h1':
                        tag = 'title';
                        break;
                        case 'h3':
                        tag = 'heading';
                        break;
                        case 'pre':
                        tag = 'codeblock';
                        break;
                        case 'p':
                        tag = 'body';
                        break;
                        case 'span':
                        tag = 'span';
                        break;
                    default:
                        break;
                }
                stylesJson = JSON.stringify({
                    type: 'selectedTag',
                    data: tag});
                sendMessage(stylesJson);
            }

            document.addEventListener('selectionchange', function() {
                getSelectedStyles();
                getSelectedTag();
            });

            document.getElementById("editor").addEventListener("input", function() {

                var range = getRange()

                var obj = {range: range, text: document.getElementById("editor").innerHTML}



                let contentChanged = JSON.stringify({
                    type: 'onChange',
                    data: obj });

                sendMessage(contentChanged);

            }, false);

            var applyToolbar = function(toolType, value = '') {

                switch (toolType) {
                    case 'bold':
                        document.execCommand('bold', false, '');
                        break;
                        case 'italic':

                        document.execCommand('italic', false, '');
                        break;
                        case 'underline':
                        document.execCommand('underline', false, '');
                        break;
                        case 'lineThrough':
                        document.execCommand('strikeThrough', false, '');
                        break;
                        case 'body':
                        document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                        document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');
                        document.execCommand('formatBlock', false, 'p');
                        break;
                        case 'title':
                        document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                        document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');

                        document.execCommand('formatBlock', false, 'h1');
                        
                        break;
                        case 'codeblock':
                            document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                            document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');
                        // document.execCommand("insertHTML", false, "<pre><code>"+ document.getSelection()+"</code></pre>");
                        document.execCommand('formatBlock', false, 'pre');
                        break;
                        case 'heading':
                        document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                        document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');
                        document.execCommand('formatBlock', false, 'h3');
                        break;
                        case 'ol':
                        document.execCommand('formatBlock', false, 'p');
                        document.execCommand('insertorderedlist');
                        break;
                        case 'ul':
                        document.execCommand('formatBlock', false, 'p');
                        document.execCommand('insertUnorderedList');
                        break;
                        case 'color':
                        document.execCommand('foreColor', false, value);
                        break;
                        case 'highlight':
                        document.execCommand('backColor', false, value);
                        break;
                        case 'image':
                        var img = "<img src='" + value.url + "' id='" + value.id + "' width='" + Math.round(value.width) + "' height='" + Math.round(value.height) + "' alt='" + value.alt + "' />";
                         if(document.all) {
                             var range = editor.selection.createRange();
                             range.pasteHTML(img);
                             range.collapse(false);
                             range.select();
                           } else {
                             doc.execCommand("insertHTML", false, img);
                           }
                        break;
                        case 'size':
                           // editor.innerHTML = value.text;


                          // alert('size')
                          //  alert(JSON.stringify(value.range))

                         

                                try {

                                    lastRange = value.range
                               

                                     editor.focus()
                               if (lastRange) { 

                                 
                                var sel=window.getSelection(),range=sel.getRangeAt(0);
                                var x,C,sC=editor,eC=editor;

                                

                                C=lastRange.sC;x=C.length;while(x--)sC=sC.childNodes[C[x]];
                                C=lastRange.eC;x=C.length;while(x--)eC=eC.childNodes[C[x]];

                                range.setStart(sC,lastRange.sO);
                                range.setEnd(eC,lastRange.eO);
                                sel.removeAllRanges();
                                sel.addRange(range)
                              }

                              //  alert(JSON.stringify(lastRange) + ' ' + value.text)

                              doc.execCommand("insertHTML", false, value.text);

                             
                                var range = getRange()

                                  var obj = {range: range, text: editor.innerHTML}

                                  sendMessage(
                                    JSON.stringify({
                                    type: 'save',
                                    data: obj})
                                    );


                                }
                                catch (error) {
                                    alert("Editor error " + error.message + ' ' + JSON.stringify(sC) + ' ' + lastRange.sO + ' ' + JSON.stringify(eC) + ' ' + lastRange.eO)
                                }
                          

                            /*
                         if(document.all) {
                            alert('doc' + value)
                             var range = editor.selection.createRange();
                             range.pasteHTML(value);
                             range.collapse(false);
                             range.select();
                           } else {
                            alert('no doc' + value)
                             doc.execCommand("insertHTML", false, value);
                           }*/
                        break;

                       /* case 'save_range':

                        //alert('save_range')
                          var lastRange = getRange()
  alert(JSON.stringify(lastRange));


                    //    alert(range)  
                          //var range = editor.selection.createRange();
    //alert(document.all + editor.selection)
   // alert(editor.selection.getRangeAt(0).toString())
    
                        break*/
                       
                    default:
                        break;
                }
                getSelectedStyles();
                getSelectedTag();
            }

            var getRequest = function(event) {
                 
              var msgData = JSON.parse(event.data);
              if(msgData.type === 'toolbar') {
                applyToolbar(msgData.command, msgData.value || '');
              }
              else if(msgData.type === 'editor') {
                switch (msgData.command) {
                case 'focus':

                
                //alert(editor);

                //document.getElementById('editor').focus();
                 editor.focus();

                 //setCurrentCursorPosition(2)
                  break;
                case 'blur':
                  editor.blur();
                  break;
                case 'getHtml':


                  //alert('getHtml')


                  var range = getRange()

                  var obj = {range: range, text: editor.innerHTML}

                  sendMessage(
                    JSON.stringify({
                    type: 'getHtml',
                    data: obj})
                    );
                  break;
                case 'setHtml':
                  editor.innerHTML = msgData.value;



                   var msgJson = JSON.stringify({
                    type: 'htmlSet',
                    data: ''});
                    sendMessage(msgJson);
                  break;
                  case 'style':
                    editor.style.cssText = msgData.value;
                    break;
                    case 'placeholder':
                      editor.setAttribute("placeholder", msgData.value);
                    break;
                default: break;
              }
            }
                 
                 
            };

            document.addEventListener("message", getRequest , false);
            window.addEventListener("message", getRequest , false);
            
        })(document)
    </script>

</body>
</html>
`;

export default editorHTML;
