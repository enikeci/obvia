/**
 * This is a Text Input Element
 *
 * Kreatx 2018
 */

//component definition
var TextInput = function(_props, overrided=false)
{
    Object.defineProperty(this, "name",
        {
            get: function name()
            {
                return _name;
            },
            set: function name(n)
            {
                if(_name != n)
                {
                    _name = n;
                    if(_name)
                    {
                        if(this.$el)
                        {
                            this.$el.attr('name', _name);
                        }
                    }else
                    {
                        if(this.$el)
                        {
                            this.$el.removeAttr('name');
                        }
                    }
                }
            }
        });
    Object.defineProperty(this, "value",
        {
            get: function value()
            {
                return _value;
            },
            set: function value(v)
            {
                if(_value != v)
                {
                    _value = v;
                    if(_value)
                    {
                        if(this.$el)
                        {
                            this.$el.attr('value', _value);
                        }
                    }else
                    {
                        if(this.$el)
                        {
                            this.$el.removeAttr('value');
                        }
                    }
                }
            }
        });
    Object.defineProperty(this, "required",
        {
            get: function required()
            {
                return _required;
            },
            set: function required(v)
            {
                if(_required != v)
                {
                    _required = v;
                    if(_required)
                    {
                        if(this.$el)
                        {
                            this.$el.attr('required', _required);
                        }
                    }else
                    {
                        if(this.$el)
                        {
                            this.$el.removeAttr('required');
                        }
                    }
                }
            }
        });

    this.template = function ()
    {
        return  "<input type='text' id='" + this.domID + "' "+(_name?"name='"+_name+"'":"")+"  "+(_required?"required":"")+"  "+(_disabled?"disabled":"")+" class='"+this.cssClass+"' "+(_value?"value='"+_value+"'":"")+">";
    };

    var _defaultParams = {
        label:"",
        name:"",
        value:"",
        class:"form-control"
    };
    _props = extend(false, false, _defaultParams, _props);

    var _name = _props.name;
    var _value = _props.value;
    var _required = _props.required;
    var _disabled = _props.disabled;
    var _change = _props.change;

    Component.call(this, _props, true);

    this.registerEvents= function () {
        return [
            {
                registerTo: this.$el, events: {
                    'afterAttach': this.afterAttach.bind(this),
                    'change': _change && typeof _change == 'function' ? _change.bind(this) : undefined
                }
            }
        ]
    };

    if(overrided)
    {
        this.keepBase();
    }
};
TextInput.type = 'text';