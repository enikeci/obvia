var loader = new Loader({ id: 'loader' });
$('#root').append(loader.render());
loader.show();

var myContainer = new Container({
    id: 'nestedLayout',
    components:[
        {
            ctor: Container,
            props: {
                id: '',
                type: ContainerType.ROW,
                components:[
                    {
                        ctor: Container,
                        props: {
                            id: '',
                            type: ContainerType.COLUMN,
                            spacing: {colSpan:6},
                            components:[
                                {
                                    ctor: Container,
                                    props: {
                                        id: '',
                                        type: ContainerType.ROW,
                                        components:[
                                            {
                                                ctor: Container,
                                                props: {
                                                    id: '', 
                                                    classes:["border"],
                                                    components:[
                                                        {
                                                            ctor: Label,
                                                            props: {
                                                                id: 'label',
                                                                label: '1st Row'
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    ctor: Container,
                                    props: {
                                        id: '',
                                        type: ContainerType.ROW,
                                        components:[
                                            {
                                                ctor: Container,
                                                props: {
                                                    id: '',
                                                    classes:["border"],
                                                    components:[
                                                        {
                                                            ctor: Label,
                                                            props: {
                                                                id: 'label',
                                                                label: '2nd Row'
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        ctor: Container,
                        props: {
                            id: '',
                            type: ContainerType.COLUMN,
                            spacing: {colSpan:6},
                            classes:["border"],
                            components:[
                                {
                                    ctor: Label,
                                    props: {
                                        id: 'label',
                                        label: 'Spans 2 Rows'
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
});
myContainer.on('creationComplete', function(e){
    loader.hide();    
});
myContainer.renderPromise().then(function(cmpInstance){
    $('#root').append(cmpInstance.$el);
});
