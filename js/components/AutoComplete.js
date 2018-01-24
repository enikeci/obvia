/**
 * This is an AutoComplete Element
 * 
 * Kreatx 2018
 */

//component definition
var AutoComplete = KxGenerator.createComponent({
    //model binds to the template
    //if you want variables to bind, you must declare them in the model object
    initModel: function () {
        return {
            fieldName: this.fieldName,
            label: this.label,
            blockProcessAttr: this.required ? false : this.blockProcessAttr,
            versionStyle: this.versionStyle,
            required: this.required,
            openModal: this.openModal.bind(this),
            multipleSelection: this.multipleSelection,
            optionsData: this.dataProvider,
            selectedOptions: this.value
        }
    },

    beforeAttach: function () {
        
    },

    afterAttach: function () {
        this.createModal();
        this.renderSelect2();
    },

    createModal: function () {
        var _self = this;

        this.modal = new Modal({
            id: 'autocomplete-modal-' + this.id,
            size: 'modal-lg',
            title: 'Vlerat e Autocomplete',
            body: '<div class="row">' +
                '<div class="col-md-12">' +
                '<div class="table-responsive" style="margin-left:10px;">' +
                '<table id="combo_category_table" class="table table-striped table-bordered table-hover display" style="width: 100%">' +
                '<thead>' +
                '<tr>' +
                '<th>Emri</th>' +
                '</tr>' +
                '</thead>' +
                '</table>' +

                '</div>' +
                '</div>' +
                '</div>'
        });

        $('#' + this.id + '-autoselect-modal').html(
            _self.modal.render()
        );
      
    },

    openModal: function () {
        var $combo_category_table;
        $('#combo_category_table').DataTable().destroy();
        $combo_category_table = $('#combo_category_table').DataTable({
            columns: [
                {"title": "Emri"},
            ],
            data: this.tableData
        });
        
        this.modal.show();
    },

    registerEvents: function () {
        var _self = this;
        var model = this.getModel();

        this.$el.on('change', function (e) {
            model.selectedOptions = [];
            var selected = $('#' + _self.fieldName + '_select').val().split(",");
            if (selected[0] != "")
                selected.forEach(function (item) {
                    var option = model.optionsData.filter(function (option) {
                        return option.id == item;
                    });
                    model.selectedOptions.push(option[0]);
                });
            
            _self.value = model.selectedOptions;
            _self.setModelValue('selectedOptions', _self.value);
        });
    },

    renderSelect2: function () {
        var _self = this;

        $('#' + this.fieldName + '_select').select2({
            multiple: _self.getModelValue('multipleSelection'),
            minimumInputLength: 2,
            placeholder: 'Search',
            allowClear: true,
            data: _self.getModelValue('optionsData'),
            formatResult: function (data) {
                return '<div class=\"select2-user-result\">' + data.text + '</div>';
            },
            formatSelection: function (data) {
                if (data != undefined)
                    return data.text;
            },
            separator: ',',
            width: 'off',
            initSelection: function (element, callback) {
                !_self.getModelValue('multipleSelection') ?
                    callback(_self.getModelValue('selectedOptions')[0]) :
                    callback(_self.getModelValue('selectedOptions'));
            }
        });

        $('#' + this.fieldName + '_select').select2('val', '222');
        $('#' + this.fieldName + '_select').addClass('form-control');
    },

    getValue: function () {
        return this.value;
    },

    setValue: function (value) {
        
        var values = value.map(function (obj) {
            return obj.id;
        }).join(",");

        $('#' + this.fieldName + '_select').val(values);
        this.$el.trigger('change');
    },

    destruct: function () {
        $('#' + this.fieldName + '_select').select2('destroy');
        this.$el.remove();
    },

    template: function () {
        return "<div id='" + this.id + "'>" +
                    "<div class='form-group col-lg-" + this.colspan + "' rowspan" + this.rowspan + " resizable' id='" + this.fieldName + "_container' >" +
                    "<label rv-style='versionStyle' rv-for='fieldName'>{label} <span rv-if='required'>*</span></label>" +
                    "<div class='input-group'>" +
                        "<span rv-if='blockProcessAttr' class='block-process'> * </span>" +
                        "<input type='hidden' name='" + this.fieldName + "_select[]' id='" + this.fieldName + "_select' />" +
                        "<span class='input-group-btn'>" +
                            "<button type='button' style='margin-left: 5px;'" +
                                "class='glyphicon glyphicon-folder-open btn btn-default'" +
                                "title='go' id='" + this.fieldName + "_btn'  rv-on-click='openModal'>" +
                                "<b class='caret'></b>" +
                            "</button>" +
                        "</span>" +
                    "</div>" +
                "</div>" +
                "<div id='" + this.id + "-autoselect-modal'></div>" +
            "</div>";
    },

    render: function () {
        return this.$el;
    }
});

//component prototype
AutoComplete.type = 'autocomplete';
