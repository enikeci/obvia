/**
 * This is a DataGrid component
 * 
 * Kreatx 2018
 */

//component definition
var DataGrid = function(_props)
{
    let _self = this;
    let _currentIndex = 1;
    let _$hadow = $("<div/>"); 
    
    Object.defineProperty(this, "currentIndex",
    {
        get: function currentIndex()
        {
            return _currentIndex;
        }
    });

    Object.defineProperty(this, "rowItems",
    {
        get: function rowItems()
        {
            return _rowItems;
        }
    });
    Object.defineProperty(this, "dataProvider", 
    {
        get: function dataProvider() 
        {
            return _dataProvider;
        }
    });

    Object.defineProperty(this, "columns", {
        get: function columns() {
            return _columns;
        },
        configurable: true,
        enumerable:true
    });  

    let _currentItem = {};
    let _rowItems = [];
    
    let _prevScrollTop = 0;
    let _avgRowHeight = undefined;
    let _virtualIndex = 0;
    let _scrollRowStep = 0;

    let _onScroll = function(e) 
    {
        let scrollTop = e.target.scrollTop;
        _scroll(scrollTop);
    };

    _scroll = function (scrollTop)
    {
        if(scrollTop>=0){
            console.log("scrollTop:",scrollTop);
                
            let virtualIndex = Math.ceil(scrollTop / _avgRowHeight);
            scrollTop = virtualIndex * _avgRowHeight;
            //this.scroll(scrollTop);

            let deltaScroll =  _prevScrollTop - scrollTop;
        

            let scrollRowStep = Math.ceil(Math.abs(deltaScroll) / _avgRowHeight) * (deltaScroll/Math.abs(deltaScroll));

            if(deltaScroll < 0){
                console.log("scroll down");
                
            }else{
                console.log("scroll up");  
                    
            }
        
            virtualIndex = (_rowCount+virtualIndex < _dataProvider.length) ? virtualIndex : (_dataProvider.length-_rowCount);        
            _prevScrollTop = scrollTop;
            if(_virtualIndex != virtualIndex){
                _self.applyVirtualBindings(virtualIndex);
                _virtualIndex = virtualIndex;

                if(scrollRowStep!=0){
                    if(_self.editPosition!=null){
                        let newEditPosition = (_self.editPosition.rowIndex + scrollRowStep);
                        if(_self.editPosition.event == 1 || _self.editPosition.event==3){
                        
                            if(_self.editPosition.event == 1){
                                _self.cellEditFinished(_self.editPosition.rowIndex, _self.editPosition.columnIndex, false);
                                _self.cellItemRenderers[_self.editPosition.rowIndex][_self.editPosition.columnIndex].show();  
                            }
                            
                            _self.editPosition.rowIndex = newEditPosition;

                            if((newEditPosition >=0) && (newEditPosition<_rowCount)){
                                console.log("show editor phase", _self.editPosition.event, " at: ", newEditPosition," ",_self.editPosition.rowIndex," ",scrollRowStep);
                                _self.cellEdit(newEditPosition, _self.editPosition.columnIndex);
                                //TODO:need to add a parameter to cellEdit handler 
                                //so that we do not set the value of the editor to the value in the dp, but just keep the not-yet stored value.
                            }else{
                                //edited cell is out of view
                                console.log("event = 3");
                                _self.editPosition.event = 3;
                                _scrollRowStep = scrollRowStep;
                                
                            }
                        
                        }else{
                            //normalize edit row index
                            _self.editPosition.rowIndex = newEditPosition;
                        }
                    }
                }
            }
            _self.$message.remove();
        }
    };
   
    this.template = function () 
    {
        let html = 
            "<div id='" + this.domID + "' data-triggers='cellEditFinished cellEdit rowEdit rowAdd rowDelete beginDraw endDraw rowClick rowDblClick cellStyling rowStyling'  style='overflow-y: scroll'>" +
                "<table class='table' id='" + this.domID + "-table'>"+
                    "<thead id='" + this.domID + "-header'>"+
                    "</thead>"+
                "</table>"+
            "</div>";    
        return html;
    };

    this.setCellsWidth = function()
    {
        //at least one row ?
        if(this.cells.length>0){
            let definedWidth = 0; let autoWidthColumns = [];
            for (let columnIndex=0;columnIndex<_columns.length;columnIndex++) {
                let column = _columns[columnIndex];
                if(column["width"]){
                    definedWidth += column.calculatedWidth = column.width;
                }else{
                    autoWidthColumns.push(column);
                }
            }
            let autoWidth = (this.$table.width() - definedWidth) / autoWidthColumns.length;
            for (let columnIndex=0;columnIndex<autoWidthColumns.length;columnIndex++) {
                let column = autoWidthColumns[columnIndex];
                column.calculatedWidth = autoWidth;
            }
            for (let columnIndex=0;columnIndex<this.cells[0].length;columnIndex++) {
                this.cells[0][columnIndex].css({"width":(_columns[columnIndex].calculatedWidth)+"px"}); 
            }
        }
    };

    this.renderRows = function(startIndex, endIndex) 
    {
        endIndex = endIndex > _dataProvider.length ? _dataProvider.length: endIndex;
        startIndex = startIndex < 0 ? 0: startIndex;
        // _rowItems = {}; we need this if we create Repeater instances via Object.assign
        let _compRenderPromises = [];
        for(let i=startIndex;i<endIndex;i++)
        {
            _compRenderPromises.splicea(_compRenderPromises.length, 0, this.addRow(extend(false, false, _dataProvider[i]), i + 1));
        } 
        if(this.allowNewItem && endIndex==_dataProvider.length)
        { 
            _compRenderPromises.splicea(_compRenderPromises.length, 0, this.addEmptyRow());
        }
        Promise.all(_compRenderPromises).then(function() {
            _$hadow.contents().appendTo(_self.$table);
            _self.$el.trigger('endDraw');
        });
    };

    this.addEmptyRow = function()
    {
        let emptyObj = this.defaultItem = createEmptyObject(_columns, "field", "description");
        _dataProvider.pad(emptyObj, 1);
        let _compRenderPromises = this.addRow(extend(false, false, _dataProvider[i]), i + 1);
        return Promise.all(_compRenderPromises).then(function() {
            _$hadow.contents().appendTo(_self.$table);
        });
    };

    this.applyVirtualBindings = function(virtualIndex)
    {
        for(let rowIndex=0;rowIndex<_rowCount;rowIndex++)
        {
            for(let columnIndex=0;columnIndex<_columns.length;columnIndex++)
            {
                let itemRenderer = this.cellItemRenderers[rowIndex][columnIndex];
                this.cellItemRenderers[rowIndex][columnIndex].repeaterIndex = rowIndex + virtualIndex;
                itemRenderer.refreshBindings(_dataProvider[rowIndex + virtualIndex]);
            }
            this.cells[rowIndex][0].prev().text(rowIndex + virtualIndex + 1);
        }
    };

    this.headerClickHandler = function (e, hIndex, column) 
    {
        if (typeof this.onheaderclick == 'function')
            this.onheaderclick.apply(this, arguments);
        alert("headerClickHandler");
            if(!e.isDefaultPrevented() && column.sortable){
                this.columnSort.call(this, hIndex, column);
            }    
    };

    this.columnSort = function(columnIndex, column)
    {
        /*
        addClass() - Adds one or more classes to the selected elements
        removeClass() - Removes one or more classes from the selected elements
        toggleClass() - Toggles between adding/removing classes from the selected elements
        */
        alert("stub for columnSort :"+columnIndex);
    };

    this.createHeader = function () 
    {
        let headerHtml = "<tr>";
        let hi = 0;
        if(_showRowIndex){
            headerHtml += "<th>#</th>";
        }
        headerHtml += "</tr>";
        let $header = $(headerHtml);
        let sortDirFADic = {"asc":"down", "desc":"up"};
        let colElements = new Array(_columns.length);
        for (let columnIndex=0;columnIndex<_columns.length;columnIndex++) {
            let column = _columns[columnIndex] = new DataGridColumn(_columns[columnIndex]);
            
            $th = $("<th id='head_"+hi+"'>"+column.description+(column.sortable ? "<span class='fa fa-caret-"+(sortDirFADic[column.sortDirection.toLowerCase()])+"'></span></a>":"")+"</th>");    
            $th.bind('click', 
            (function(hIndex, column){
                return (function(e) { // a closure is created
                    _self.headerClickHandler.call(_self, e, hIndex, column);
                    });	
            })(hi, column));
            //put elements in an array so jQuery will use documentFragment which is faster
            colElements[columnIndex] = $th
            ++hi;  
        }
        $header.append(colElements);
        this.$header.append($header);
    },
    this.cellEdit = function(rowIndex, columnIndex)
    {
        let e = jQuery.Event('cellEdit');
        _self.trigger(e, [rowIndex, columnIndex]);
        if(!e.isDefaultPrevented())
        {
            if(this.editPosition!=null && this.editPosition.event==1 && (this.editPosition.rowIndex != rowIndex || this.editPosition.columnIndex != columnIndex)){
            
                let r = this.cellEditFinished(this.editPosition.rowIndex, this.editPosition.columnIndex, true);
                
                if (!r) {
                    return;
                }
                this.editPosition.event = 1;
                this.cellItemRenderers[this.editPosition.rowIndex][this.editPosition.columnIndex].show();
            }

            if(columnIndex > _columns.length-1)
            {
                columnIndex = 0;
                ++rowIndex;
            }else if(columnIndex < 0)
            {
                columnIndex = _columns.length-1;
                --rowIndex;
            }
            let column = _columns[columnIndex];
            let data;

            if(rowIndex > _rowCount - 1){
                this.editPosition.rowIndex = rowIndex;
                this.editPosition.columnIndex = columnIndex;

                rowIndex = _rowCount - 1;
                this.editPosition.event = this.editPosition.event==1?3:this.editPosition.event;
                
                //this.$el.scrollTop(_prevScrollTop + _avgRowHeight);
                let ps = _prevScrollTop ;
                this.scroll(ps + _avgRowHeight);
                //this.$table.css({"margin-top":(ps + _avgRowHeight)});
            // this.$scroller.css({"margin-top": (-(this.realHeight)-(ps + _avgRowHeight))+"px"});

                data = _dataProvider[rowIndex+_virtualIndex];
                
                
            }else if(rowIndex < 0){
                this.editPosition.rowIndex = rowIndex;
                this.editPosition.columnIndex = columnIndex;

                rowIndex = 0;
                this.editPosition.event = this.editPosition.event==1?3:this.editPosition.event;
                this.$el.scrollTop(_prevScrollTop - _avgRowHeight);
            
                //this.scroll(_prevScrollTop - _avgRowHeight);

                data = _dataProvider[rowIndex+_virtualIndex];
                
            }else{
                data = _dataProvider[rowIndex+_virtualIndex];
            }

            this.editPosition = {"rowIndex":rowIndex, "columnIndex":columnIndex, "column":column, "data":data, "event":1}; 
            
            this.cellItemRenderers[rowIndex][columnIndex].hide();
            let itemEditorInfo = this.cellItemEditors[columnIndex];
            let itemEditor;
            if(itemEditorInfo == undefined)
            {
                if(column.itemEditor.props["value"]==null)
                {
                    column.itemEditor.props["value"] = "{?"+column.field+"}";
                }
                column.itemEditor.props.bindingDefaultContext = data;
                itemEditor = Component.fromLiteral(column.itemEditor);
                column.itemEditor.props.label = column.description; 
                //let props = extend(true, true, column.itemEditor.props);
                //delete props["value"];

                itemEditor.parent = this;
                itemEditor.parentType = 'repeater';
                itemEditor.parentForm = this.parentForm;
                itemEditor.$el.css("margin","0px");
            // let itemEditorWidth = column.calculatedWidth-(this.cells[rowIndex][columnIndex].outerWidth() - this.cells[rowIndex][columnIndex].innerWidth()) - 2;
                let itemEditorWidth = column.calculatedWidth-46;
                itemEditor.$el.css({"outline":"none", "font-size":"14px", "width":itemEditorWidth+"px"});

                this.cellItemEditors[columnIndex] = {"itemEditor":itemEditor, "rowIndex":rowIndex}; 

                itemEditor.on('creationComplete', function(){

                    if (typeof itemEditor['focus'] === "function") { 
                        // safe to use the function
                        itemEditor.focus();
                    }
                });  
                itemEditor.on('keydown', function(e) { 
                    switch (e.keyCode) {
                        case 9: // TAB - apply and move to next column on the same row 
                            //_self.trigger('cellEditFinished', [rowIndex, columnIndex, column, data, true]);
                            //TODO: Check columnIndex boundaries and pass to next row if it is 
                            //the last one, if now rows remaining pass to first row(check repeater implementation)
                            e.preventDefault();
                            _self.cellEdit(_self.editPosition.rowIndex, _self.editPosition.columnIndex + (e.shiftKey?-1:1));
                            break;    
                    }
                });
                itemEditor.on('keyup', function(e) { 
                        switch (e.keyCode) {
                            case 13: // ENTER - apply value
                                console.log("finished editing");
                                e.preventDefault();
                                _self.cellEditFinished(_self.editPosition.rowIndex, _self.editPosition.columnIndex, true);
                                break;
                            case 27: // ESC - get back to old value
                                e.preventDefault();
                                _self.cellEditFinished(_self.editPosition.rowIndex, _self.editPosition.columnIndex, false);
                                break;
                            
                        }
                });	

            }else
            {
                itemEditor = itemEditorInfo.itemEditor;
                //itemEditor is in another position
                if(itemEditorInfo.rowIndex != rowIndex)
                {
                    itemEditorInfo.rowIndex = rowIndex;
                    itemEditor.$el.detach();
                    //itemEditor.$el.detach();
                } 
                itemEditor.refreshBindings(data);
            }
            /*
            itemEditor.off('blur');
            itemEditor.on('blur', function(){
                _self.trigger('cellEditFinished', [rowIndex, columnIndex, column, data, true]);
            });
            */

        /*itemEditor.on('blur', (function(rowIndex, columnIndex, column, data){
                return (function(e) { // a closure is created
                    _self.cellEditFinished(rowIndex, columnIndex, column, data);
                    });	
            })(rowIndex, columnIndex, column, data));
    */



            itemEditor.repeaterIndex = rowIndex;
           
            //TODO: te evitojme v
            /*
            if (column.itemEditor.props["value"]!=null && column.itemEditor.props["value"][0] == '{' && column.itemEditor.props["value"][column.itemEditor.props["value"].length - 1] == '}') 
            {
                let dataProviderField = column.itemEditor.props["value"].slice(1, -1);
                this.cellItemEditors[columnIndex]["dataProviderValueField"] = dataProviderField;
                itemEditor.value = data[dataProviderField];
            }else
                itemEditor.value = column.itemEditor.props["value"] || data[column.field];
            */
            itemEditor.renderPromise().then(function (cmpInstance)
            {
                _self.cells[rowIndex][columnIndex].append(cmpInstance.$el);
                itemEditor.show();
                if(itemEditorInfo != null)
                {
                    if (typeof itemEditor['focus'] === "function") { 
                        // safe to use the function
                        itemEditor.focus();
                    }
                } 
            });
        }       
    };

    this.cellEditFinished = function(rowIndex, columnIndex, applyEdit)
    {
        let r = true;
        let e = jQuery.Event('cellEditFinished');
        _self.trigger(e, [rowIndex, columnIndex, applyEdit]);
        if(!e.isDefaultPrevented())
        {
            //console.trace();
            console.log("cellEditFinished:", rowIndex, " ", columnIndex);
            let column = _columns[columnIndex];
            let data = _dataProvider[rowIndex+_virtualIndex];
            let value = null, calledHandler = false;
            let itemEditorInfo = this.cellItemEditors[columnIndex];
            let itemEditor = itemEditorInfo.itemEditor;
        

            if((typeof column.cellEditFinished == 'function') && applyEdit){
                let args = [];
                for (let i = 0; i < arguments.length-1; i++) {
                    args.push(arguments[i]);
                }
                //we dont need applyEdit argument any more
                args.push(itemEditorInfo);
                value = column.cellEditFinished.apply(this, args);
                calledHandler = true;
            }
            
            if(!applyEdit || !e.isDefaultPrevented()){           
                itemEditor.hide();
                this.cellItemRenderers[rowIndex][columnIndex].show();
                if(applyEdit){
                    if(!calledHandler){
                        value = itemEditor.value;
                        let exp = itemEditor.getBindingExpression("value");
                        if(exp){
                            if(exp=="currentItem"){
                                _dataProvider[rowIndex+_virtualIndex] = value;
                            }else{
                                setChainValue(_dataProvider[rowIndex+_virtualIndex], exp, value);
                            }
                        }
                        this.cellItemRenderers[rowIndex][columnIndex].refreshBindings(_dataProvider[rowIndex+_virtualIndex]);
                        
                    }
                    //TODO:dataProviderChanged or integrate Binding ? 
                    //_dataProvider[rowIndex+_virtualIndex][column.field] = value;
                }
                this.editPosition.event = 2;
            }
        }else
            r = false;
        return r;
    };
    
     //renders a new row, adds components in stack
    this.addRow = function (data, index, isPreventable = false, focusOnRowAdd = true) 
    {
        let rp = [];
        let beforeRowAddEvent = jQuery.Event("beforeRowAdd");
        this.trigger(beforeRowAddEvent, [_self, new RepeaterEventArgs(_self.rowItems, data, index-1)]);

        if (!isPreventable || (isPreventable && !beforeRowAddEvent.isDefaultPrevented())) 
        {
            let renderedRow = $('<tr>');
            let ccComponents = [];
            let rowItems = {};
        
            if(_showRowIndex){
                renderedRow.append('<th scope="row">'+index+'</th>')
            }
            let columnIndex = 0;
            renderedRow.click(function(evt)
            {
                _self.trigger("rowClick",  [_self, new RepeaterEventArgs(_rowItems, _dataProvider[index-1 + _virtualIndex], index+_virtualIndex)]);
            });

            renderedRow.dblclick(function(evt)
            {
                _self.trigger("rowDblClick", [_self, new RepeaterEventArgs(_rowItems, _dataProvider[index-1 + _virtualIndex], index+_virtualIndex)]);
            });
            let rsEvt = jQuery.Event('rowStyling', [_self, new RepeaterEventArgs(_rowItems, _dataProvider[index-1 + _virtualIndex], index+_virtualIndex)]);

            let rowBindingFunctions = [], bIndex = 0;
            for (let columnIndex=0;columnIndex<_self.columns.length;columnIndex++) 
            {
                let column = _self.columns[columnIndex];
                //column.sortInfo:{sortOrder:0, sortDirection:"ASC"},
                //column.cellStyleFunction,
                //column.cellValueFunction,
                //column.itemEditor    
                let component = extend(true, true, column.itemRenderer);

                
                //build components properties, check bindings
                if (_self.cellItemRenderers[index-1] == undefined)
                    _self.cellItemRenderers[index-1] = [];

                let dataProviderField = column.field;
                //
                component.props["label"] = "{?"+dataProviderField+"}";
                //might not be wanted
                component.props.id = column.name;


                let cmp = _self["cellItemRenderers"][index-1];
                if (cmp[columnIndex] == undefined)
                    cmp[columnIndex] = {};

               

                /*
                cmp[columnIndex]["label"] = data[dataProviderField];
                if(_self.bindings[dataProviderField]==undefined){
                    _self.bindings[dataProviderField] = {};
                    if(_self.bindings[dataProviderField][columnIndex]==undefined){
                        //TODO: check this out
                        _self.bindings[dataProviderField][columnIndex] = {"component":cmp, "property":prop, "dataProviderField":dataProviderField, "dataProviderIndex":index};
                    }
                }
                */
                //construct the component
                component.props.bindingDefaultContext = data;
                let el = Component.fromLiteral(component);
                el.parent = _self;
                el.parentType = 'repeater';
                el.parentForm = _self.parentForm;
                el.repeaterIndex = index - 1;

                _self.cellItemRenderers[index-1][columnIndex] = el; 
                rowItems[column.name] = el;
                _rowItems[index - 1] = rowItems;
                
                //
                
                let csEvt = jQuery.Event('cellStyling', [_self, index, columnIndex, _rowItems, column, data]);
                
                if(column.editable){
                    el.on('dblclick', (function(rowIndex, columnIndex, column, data){
                        return (function(e) { // a closure is created
                            //alert(JSON.stringify(column)+" "+JSON.stringify(data)+" "+(index-1));
                            _self.cellEdit(rowIndex, columnIndex);
                        });	
                    })(index - 1, columnIndex, column, data));
                }

                //handle component change event and delegate it to repeater
                el.on('creationComplete', function (e) { 
                    e.stopImmediatePropagation();
                    //e.stopPropagation();
                    ccComponents.push(el.id);
                    //console.log("creation Complete", this.id);
                    if (ccComponents.length == _self.columns.length) {
                        //trigger row add event
                        _self.$el.trigger('rowAdd', [_self, new RepeaterEventArgs(_rowItems, data, index)]);
                        //duhet te shtojme nje flag qe ne rast se metoda addRow eshte thirrur nga addRowHangler te mos e exec kodin meposhte
                        
                        //manage dp
                        _currentItem = data;

                        _currentIndex <= index ? _currentIndex = index : _currentIndex = _currentIndex;
                        

                        //skip dp if it already exist
                        let addRowFlag = false;
                        if (index > _dataProvider.length) {
                            _dataProvider.push(_currentItem);
                            addRowFlag = true;
                        }
                        
                        if (_currentIndex == Math.min(_rowCount, _dataProvider.length) && !addRowFlag) {
                            _self.trigger('creationComplete');
                        }

                        //animate
                        if (addRowFlag && focusOnRowAdd) {
                            _rowItems[index - 1][_self.components[0].props.id].scrollTo();
                        }         
                    
                    }
                    return false;
                });

                el.on('change', function (e) {
                    let currentItem = _dataProvider[index - 1];
                    if (tempComponent.props.value[0] == '{' && tempComponent.props.value[tempComponent.props.value.length - 1] == '}') {
                        let bindedValue = tempComponent.props.value.slice(1, -1);
                        data[bindedValue] = this.value;
                    }

                    _self.$el.trigger('rowEdit', [_self, new RepeaterEventArgs(rowItems, _dataProvider[index-1 + _virtualIndex], index+_virtualIndex)]);
                });
                //width='"+column.calculatedWidth+"'
                let cell = $("<td id='cell_"+(index-1)+"_"+columnIndex+"'></td>");
                if(_self.cells[index-1]== undefined)
                    _self.cells[index-1] = [];
                _self.cells[index-1][columnIndex] = cell;
                //render component in row
                let cp = el.renderPromise().then(function (cmpInstance)
                {
                    renderedRow.append(cell.append(cmpInstance.$el));
                    _$hadow.append(renderedRow);
                    _self["rows"].push(renderedRow); 
                });
                rp.push(cp);
            }   
        }
        return rp;
    }; 
    
    this.removeAllRows = function()
    {
        for(let i=this.rows.length;i>0;i--)
        {
            this.removeRow(i, false, false, false);
        }
        this.rows = [];
    };

    this.removeRow = function (index, isPreventable = false, focusOnRowDelete = true, removeFromDp = false) 
    {
        let rowItems = {};
        
        let removeRow = function () {
            //remove dp row
            let removedItem = null;
            if(removeFromDp){
                _dataProvider.splice(index - 1, 1);
            }
            for(let i=index-1;i<this.cellItemRenderers.length;i++){
                
                this.cellItemRenderers[i].repeaterIndex -= 1;
                this.cells[i][0].prev().text(i);
            }
            //manage dp
            _currentIndex--;
            _currentItem = _dataProvider[index - 1];
            if (_currentIndex == 1 && this.allowNewItem) {
                //model.displayRemoveButton = false;
            }
            this.rows[index-1].remove();
            this.rows.splice(index - 1, 1);
            _rowItems.splice(index - 1, 1);
            this.cells.splice(index - 1, 1);
            this.cellItemRenderers.splice(index - 1, 1);
            
            this.$el.trigger('rowDelete', [this, new RepeaterEventArgs([], _currentItem, index, rowItems)]);
            //animate
            if (focusOnRowDelete)
                this.cellItemRenderers[index-2][0].scrollTo();
            return removedItem;
        }.bind(this);

        //trigger before row delete event
        if (isPreventable) {
            //trigger before row delete event
            let beforeRowDeleteEvent = jQuery.Event("beforeRowDelete");
            this.$el.trigger(beforeRowDeleteEvent);

            if (!beforeRowDeleteEvent.isDefaultPrevented()) {
                return removeRow.call(this);
            } else {
                return false;
            }
        } else {
            return removeRow.call(this);
        }
  
    };   

    this.updateDisplayList = function(){
        _displayed = true;
        //we now know the parent and element dimensions
        _avgRowHeight = (this.$table.height() - this.$header.height())/ _rowCount;
        this.virtualHeight = _dataProvider.length * _avgRowHeight;

        this.bufferedRowsCount = _rowCount;

        let pos = this.$table.position();
        let left = pos.left + this.$table.width() - 14;
        let top = pos.top + this.$header.height();
        this.realHeight = (this.$table.height()+this.$header.height()-16);
        this.$message = $("<div>Creating Rows</div>");

        this.$scrollArea = $("<div/>");
        this.$scroller = $("<div style='border:1px solid black;position:relative; height:40px;top:15px'></div>");
        this.$scrollArea.append(this.$scroller);
        this.$scrollArea.css({border: "1px", opacity:100, "margin-top":-this.realHeight+"px", float: "right",position:"relative", "margin-left": "-16px", width:"10px", height : this.virtualHeight + "px"});
        
        this.$el.css({border: "1px solid black"});
        this.$el.css({height:this.$table.height()});
        this.$table.after(this.$scrollArea);

        this.delayScroll = debounce(_onScroll, 400);

        this.$el.on("scroll", function(e){
            if(this.virtualHeight > (e.target.scrollTop+this.realHeight)-2*_avgRowHeight){
                this.loading = true;
                this.$message.css({position:"absolute", top:150+"px", left:150+"px", "background-color":"white","z-index":9999});
                this.$el.append(this.$message);
                this.$table.css({"margin-top":e.target.scrollTop});
                this.$scrollArea.css({"margin-top": (-(this.realHeight)-e.target.scrollTop)+"px"});
                //let top = this.$scroller.position().top;
                let h = this.$scrollArea.height();
                this.$scroller.css({"top": (16 + 1.2*(h - (h- e.target.scrollTop)))+"px"});
                let cScrollHeight =  this.$scrollArea.css("height");
                this.delayScroll.apply(this, arguments)
            //this.onScroll.apply(this, arguments);
            }
        }.bind(this));
        this.setCellsWidth();
    }

    let _displayed = false;
    this.afterAttach = function (e) 
    {
        if (e.target.id == this.domID) 
        {
            let av = e.target.style.getPropertyValue('display');
            if(av!="none" && !_displayed){
                this.updateDisplayList();
            }
        }
    };

    let _defaultParams = {
        rendering: {
			direction: 'vertical',
			separator: true,
			actions: false
        },
        showRowIndex:true,
        dataProvider:[],
        rowCount:5,
        columns:[]
    };
    _props = extend(false, false, _defaultParams, _props);
    let _dataProvider = _props.dataProvider;
    let _rendering = _props.rendering;
    let _showRowIndex = _props.showRowIndex;
    let _rowCount = _props.rowCount;
    
    this.components = _props.components;
    let _columns = _props.columns;
    this.rows = [];
    this.cellItemRenderers = [[]];
    this.cellItemEditors = [];
    this.cells = [];// matrix
    this.editPosition = null;
    this.bindingExpressions = []; //array of bindings arrays (bindings for each column)
   
    Component.call(this, _props, true);
    let base = this.base;
    //overrides
    let _rPromise;
    this.renderPromise = function () 
    {
        
        this.$el.trigger('beginDraw');
        this.$table = this.$el.find("#" + this.domID + '-table');
        this.$header = this.$el.find('#' + this.domID + '-header'); 
        
        _rPromise = new Promise((resolve, reject) => {
            _self.on("endDraw", function(e){
                if (e.target.id == _self.domID) 
                {
                    resolve(this); 
                }
            });                   
        });
        
        this.createHeader();
        let len = _rowCount? Math.min(_rowCount, _dataProvider.length): _dataProvider.length;
        this.renderRows(0, len);
        return _rPromise;
    };
};
DataGrid.prototype.ctor = 'DataGrid';