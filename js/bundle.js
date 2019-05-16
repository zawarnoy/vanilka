/**
 * Категория товаров
 * @param {{}} params
 * @param {number} params.categoryId - ID категории товаров
 * @param {string} params.categoryName - Название категории товаров так же используется в качестве имя тега
 * @param {null|[]} params.products - Список товаров
 * @param {object} params.categoryContainer - Контейнер списка категорий
 * @param {number} params.gridSize - Размер сетки товаров
 * @param {string} params.categoryRef - Ссылка на страницу категорий
 * @param {string} params.categoryGalleryRef - Ссылка на страницу галлереи
 * @param {[]} params.gallery - Общая галерея
 * @param {[]} params.generalTastes - Список общих для всех товаров в категории вкусов (для select'а)
 * @param {[]} params.generalDesigns - Список общих для всех товаров вариантов украшений
 * @param {*} params.generalInfo - Общая информация
 * @constructor
 */
function Category(params){
  var id          = params.categoryId || 0,
    name          = params.categoryName || "не определено", //Название категории оно же и название фильтра
    productsRange = params.products || null,                //Список товаров в данной категории
    container     = params.categoryContainer,               //Родительскйк контейнер
    gridSize      = params.gridSize || undefined,           //Размер сетки товаров
    galleryPath   = params.galleryPath,                     //Ссылка на галлерею
    settingFile   = params.settingFile,                     //Данные для настройки карты продукта
    uniqTags      = new Tags(),                             //Список уникальных тегов
    products      = [],
    navbarConstructor,childContainer,body,navbar,
    hidden        = false;
    self = this;


  /**
   * Создать контейнер для категории
   * @returns {boolean}
   */
  this.render = function(){
    if(!container){
      console.warn("Category::parentContainer is not defined");
      return false;
    }

    var size =  gridSize ? '-' + gridSize : '-6';

    if(productsRange.length <= 1) {
      body = $('<div/>',{
        class: 'col-sm'+size+' p-0 category__content single-item'
      }).appendTo(container);
      childContainer = $(body);
    } else {
      childContainer = $('<div/>',{
        id: 'category__'+id,
        class: 'row category__content',
      });

      body = $('<div/>',{ class:'container-fluid vnl__category'})
        .append(
          $('<div/>',{class:'row category__tag'})
            .append(
              $('<h2/>')
                .append(
                  $('<i/>',{class:'fab fa-slack-hash'})
                    .append(
                      $('<strong/>',{text: name})
                    )
                )
            ),
          childContainer
        );
      body.appendTo(container);
    }
  };


  this.hasTag = function (tagName) {
    return tagName === name
  };

  this.removeLazyLoad = function(){
    products.forEach(function(product,i){
      product.removeLazyLoad();
    })
  };

  this.isHidden = function(){
    return hidden;
  };

  /**
   * Добавить массив товаров
   * @param list
   */
  this.addRange = function(list){
    if(typeof list === "string")
      list = JSON.parse(list);

    list.forEach(function(src,i){
      uniqTags.explore(src.tagList);
      products.push(
        new Product({
            productContainer: childContainer,
            gridSize: list.length < gridSize ? null : gridSize,
            id: src.id,
            href: src.href,
            name: src.name,
            description: src.description,
            thumb: src.thumb,
            tagList: src.tagList,
            overviewImages: src.overview ? src.overview : [],
            settingFile: settingFile
        })
      );

    });
    //console.log( uniqTags.getTagList() );
    navbar = new NavbarBlock({
      container: $('.navbar__secondary'),
      source: uniqTags.getTagList(),
      itemList: products
    })
  };


  /**
   * Скрыть блок
   */
  this.hide = function(){
    if(!body)return;
    body.addClass("sort__hide");
    hidden = true;
  };

  /**
   * Отобразить блок
   */
  this.show = function(){
    if(!body)return;
    body.removeClass('sort__hide')
      .addClass("sort__show");
    setTimeout(function(){
      body.removeClass("sort__show")
    },500);
    hidden = false;
  };

  (function(){
    self.render();
    self.addRange(productsRange);
  })()
}

;(function (){
  //Указать цвета проекта
  this.primaryColor = '#794A5E';
  this.secondaryColor = '#949fa5';
  this.dangerColor = '#834141';

  // Удаление элемента из массива.
  // String value: значение, которое необходимо найти и удалить.
  // return: массив без удаленного элемента; false в противном случае.
  Array.prototype.remove = function(value) {
    var idx = this.indexOf(value);
    if (idx !== -1) {
      // Второй параметр - число элементов, которые необходимо удалить
      return this.splice(idx, 1);
    }
    return false;
  };

  this.getURLParams = function() {
    var qs = document.location.search;
    qs = qs.split('+').join(' ');

    var params = {},
      tokens,
      re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
  };

  /**
   * ОПределить необходимость сортировки URL параметр sortByTag
   * @param params
   * @return {boolean}
   */
  this.isSortActionRequired = function(params){
    return ('sortByTag' in params)
  };


  /**
   * Определить необходимость выбора конкретного элемента галереи URL параметр goto
   * @param params
   * @return {boolean}
   */
  this.isSelectTargetImageRequired = function(params){
    return ( 'goto' in params )
  };


  /**
   * Найти изображение его имени
   * @param  {string} imageName - наименование изображения
   * @return {string}
   */
  this.findGalleryItemByImageName = function(imageName){
    var result = '';
    $('img').each(function(i,img){
      if( distinguishImageNameFromItem(img) === imageName )
        result  =$(img).closest('.stock__product')
    });
    return result;
  };


  /**
   * Выделить имя изображения из полного пути к файлу
   * @param  {GalleryItem} item - компонент изображения
   * @return {*}
   */
  function distinguishImageNameFromItem(item){
    var a = $(item).attr('data-src').split('/');
    return a[a.length-1].split('.')[0];
  }


  /**
   * Сортировка по тегу
   * @param tagName
   * @return {boolean}
   */
  this.sortByTag = function(tagName){
    if(!tagName) return false;
    var tags = $('.nav-tags__item');
    console.log(tags);
    tags.each(function(i,tag){
      if($(tag).attr('data-target').toUpperCase() === tagName.toUpperCase() )
        $(tag).click();
    })
  };


  /**
   * Проверить указан ли дизайн изделия
   */
  this.isProductDesignSet = function(params){
    return ( "productDesign" in params )
  };


  /**
   * Сортировка по тегу
   * @param link
   * @return {boolean}
   */
  this.transitionTo = function(link){
    if(!link) return false;
    setTimeout(function(){
      var cats = $('.category__content');
      console.log(cats);
      cats.each(function(i,cat){
        if($(cat).find('h2').text().toUpperCase() === link.toUpperCase() ) {
          $(cat).find('.stock__product').click();
          return true;
        }
      })
    },500);
  };


  /**
   * Проверить указан ли прямой переход к
   * @param params
   * @return {boolean}
   */
  this.isDirectTransitionSet = function(params){
    return ( "directTransitionTo" in params )
  };





  this.openGuideModal = function(){
    var $body = $('<div/>',{id:'vnl_modal__guide'})
      .append(
        $('<div/>',{
          class: 'container-fluid py-5',
          text:'Мы хотим максимально полно осуществить вашу мечту, поэтому предлагаем вам выбрать одну из представленных начинок'
        })
      )
      .appendTo('body');

    $body.iziModal({
      headerColor: common.primaryColor,
      title: "Шаг 1",
      subtitle: "Выбор вкуса",
      autoOpen: true,
      closeButton: true
    })
  };



  /**
   * Перетрясти массив в рандомном порядке
   * @param {[]} arr - массив
   * @return {boolean|[]} - массив с элементами в рандомном порядке
   */
  this.randomizeArray = function(arr){
    if(!arr) return false;
    return arr.sort(function(){return Math.random() - 0.5;});
  };

  return window.common = this;
})();

;function Gallery(params) {
  var container      = params.galleryContainer,
    gridSize         = 4,
    self             = this,
    uniqTags         = new Tags(),
    productLink      = params.productLink || "showcase__stuffing.html",
    productLinkTitle = params.productLinkTitle || "В начинки",
    src              = params.src,
    imageArray       = [],
    navbar,
    body,
    items            = [];

  function collectSourceData(src){
    var result = [];
    src.forEach(function(category){
      uniqTags.explore(category.tagList);
      for(var i = 1; i < (category.length + 1); i++){
        result.push({
          index  : i,
          imgSrc : category.folder + '/'+ category.prefix + i + '.jpg',
          href   : ('directTransitionTo' in category ? category.directTransitionTo : null),
          name   : category.tag,
          tags   : category.tagList
        })
      }
    });
    return result;
  }

  function render() {
    var collection = common.randomizeArray( collectSourceData(src) );

    collection.forEach(function (item) {
        items.push(
          new GalleryItem({
            container         : container,
            thumb             : item.imgSrc,
            gridSize          : gridSize,
            productLink       : productLink,
            directTransitionTo: item.href,
            productLinkTitle  : productLinkTitle,
            id                : item.index,
            name              : item.name,
            tagList           : item.tags
          })
        );
    });

    navbar = new NavbarBlock({
      container: $('.navbar__primary'),
      source: uniqTags.getTagList(),
      itemList: items
    })
  };

  (function(){
    render();
  })()
};
/**
 * Картинка в галлерее
 * @param {{}} params
 * @constructor
 */
function GalleryItem(params){
    var idProduct          = params.id,
        thumb              = params.thumb || "...",
        productLink        = params.productLink ||"showcase__stuffing.html",
        productLinkTitle   = params.productLinkTitle || "В начинки",
        directTransitionTo = params.directTransitionTo || null,
        container          = params.container,
        tagList            = params.tagList || [],
        gridSize           = params.gridSize || '',
        name               = params.name || "Lorem ipsum",
        hidden             = false,
        body,
        self               = this;

    /**
     * Отрисовать продукт если указан родительский элемент
     */
    this.render = function(){
        if(!container){
            console.warn("GalleryItem::container is not defined");
            return false;
        }

      var dtt = directTransitionTo ? '&directTransitionTo='+directTransitionTo : '';
      var footer = $('<div/>',{class:'modal-footer__content'})
        .append(
          $('<div/>',{
            //text:'Вы можете скопировать ссылку на изображение и использовать при заказе торта: ' + document.domain + '/' + thumb.replace('../../', '')
          }),
          $('<div/>',{class:'d-flex justify-content-center w-100'})
            .append(
              $('<a/>',{
                class:'btn btn-outline-primary py-2 px-5 mt-2',
                href :productLink + "?productDesign=" +  thumb.replace('../../', '')+dtt,
                text :productLinkTitle})
            )
        );
        footer = footer.wrap().html();

      gridSize = gridSize ? '-sm-'+gridSize : '-12';

        body = $('<a/>', {
          class: "tetragon" + gridSize + " stock__product p-1",
          href: thumb,
          //'data-title': name,
          'data-footer': footer,
          'data-gallery': "gallery__item",
          'data-toggle': "lightbox",
          'data-width': "800",
          'data-height': "800",
          click: function (event) {
              event.preventDefault();
              $(this).ekkoLightbox({
                //alwaysShowClose: true
              });
            }
          })
          .append(
            $('<div/>',{class:'tetragon__wrapper'})
              .append(
                $('<div/>',{class:'tetragon__content'})
                  .append(
                    $('<img/>',{
                      class:'product__thumb d-block w-100 h-100',
                      src: 'img/pre-loader.gif',
                      'data-src': thumb,
                      alt: name,
                      error: function(){
                        this.classList.add('invalid-image-src')
                      },
                      ready: function(){
                        $(this).lazyLoadXT()
                      }
                    })
                  )
              )
          );
        body.appendTo(container);
    };


  /**
   * Убрать ленивую загрузку изображений
   */
  this.removeLazyLoad = function () {
        var $a = $(body).find('img');
        var b = $a.attr('data-src');
        $a.attr('src',b);
    };

    /**
     * Скрыть блок
     */
    this.hide = function(){
        if(!body)return;
        hidden = true;
        body.addClass("sort__hide animated flipOutY");
    };


    /**
     * Отобразить блок
     */
    this.show = function(){
        if(!body)return;
        hidden = false;
        body.removeClass('sort__hide animated flipOutY')
            .addClass("sort__show animated flipInY");
        setTimeout(function(){
            body.removeClass("sort__show animated flipInY")
        },500);
    };


    /**
     * Проверить существования тега в списке тегов
     * @param tagName
     * @returns {boolean}
     */
    this.hasTag = function (tagName) {
        return tagList.indexOf(tagName) !== -1;
    };


    /**
     * Проверить скрыт ли компонент
     * @return {boolean}
     */
    this.isHidden = function(){
      return hidden;
    };


    this.getImage = function(){
        return thumb
    };


    this.getName = function(){
        return name;
    };


    /**
     * Возвратить указатель на элемент в дереве объектов
     * @returns {*}
     */
    this.getBody = function(){
        return body;
    };


    /**
     * Возвратить список тегов
     * @returns {*|Array}
     */
    this.getTagList = function(){
        return tagList
    };


    (function(){
        self.render()
    })()

}


function OrderConfirmationModal(params){
  var title     = params.title || 'Спасибо за ваш заказ',
    subtitle  = params.subtitle || 'мы скоро с вами свяжемся',
    content   = params.content,
    type      = params.type || 'success',
    SUCCESS   = common.secondaryColor,
    DANGER    = common.dangerColor,
    $body;

  function render(){
    $body = $('<div/>',{id: 'order-confirmation'})
      .append(
        $('<div/>',{
          class: 'container-fluid py-5',
          html:  content
        })
      );
    $body.appendTo('body');
    $body.iziModal({
      title: title,
      subtitle: subtitle,
      zindex: 20000,
      headerColor: (type === 'success' ? SUCCESS : DANGER),
      autoOpen:true,
      onClosed: function(){
        $(this).iziModal('destroy');
        $body.remove();
      }
    })
  }

  (function(){
    render();
  })()
}
/**
 * Одальное окно для ввода данных о пользователе
 * основано на компонненте iziModal
 * @param params
 * @constructor
 */
function PersonCardModal(params){
  var container = params.container,
    $body       = '',
    self        = this;


  /**
   * Создание компонента ввода данных на форме
   * @param {string}  className   - класс компонента (обычно это ширина колонки)
   * @param {string}  caption     - название вводимого параметра
   * @param {string}  type        - тип элемента input
   * @param {string}  name        - имя элемента input
   * @param {string}  placeholder - текст плейсходер
   * @param {boolean} isReq       - признак обязательности заполнения поля (по умолчанию false)
   * @return {jQuery}
   */
  function addField({className='',caption='Поле ввода',type='text',name='',placeholder='Введите текст',isReq=false}){
    return $('<div/>',{class: className})
      .append(
        $('<label/>',{class: 'mt-3 text-dark',text: caption}),
        $('<input/>',{
          class:'form-control text-dark',
          type: type,
          placeholder: placeholder,
          ready: function () {
              $(this).unbind('focus').unbind('focusin');
          },
          name: name,
          required: isReq
        })
      )
  }


  /**
   * Создание модального окна ввода данных о пользователе и инициализация его как компонента iziModal
   */
  function render() {
    $(container).find('.iziModal-content').remove();
    $body = $('<div/>',{id:'modal', class:'skit__iziModal person-modal'}).append(
      $('<form/>',{class: 'orderOver'}).append(
        $('<div/>',{class:'container-fluid'}).append(
          $('<div/>',{class:'row'}).append(
            addField({
              className:'col-sm-12',
              caption: 'Фамилия :',
              type: 'text',
              name: 'lastName',
              placeholder: 'Фамилия',
              isReq: false
            }),
            addField({
              className:'col-sm-12',
              caption: 'Имя* :',
              type: 'text',
              name: 'firstName',
              placeholder: 'Имя',
              isReq: true
            })
          ),
          $('<div/>',{class: 'row mt-3'}).append(
            addField({
              className:'col-sm-12',
              caption: 'Телефон для связи* :',
              type: 'text',
              name: 'phone',
              placeholder: '+375(ХХ)ХХХ-ХХ-ХХ',
              isReq: true
            })
          ),
          $('<div/>',{class:'row mt-3'}).append(
            addField({
              className:'col-sm-12',
              caption: 'Адрес электронной почты* :',
              type: 'text',
              name: 'email',
              placeholder: 'Example@mail.com',
              isReq: true
            })
          ),
          $('<div/>',{class:'row my-3'}).append(
            $('<div/>',{class: 'col-12 d-flex justify-content-center'}).append(
              $('<input type="submit" id="end-of-ordering" class="btn btn-outline-primary p-4" value="Отправить"/>'),
            )
          )
        )//end container-fluid
      )//end form
    )
      .appendTo(container);
    $body.on('submit','.orderOver',function () {
        $body.iziModal('close');
        $('body').trigger('personModalClosed', self.getData());
        return false;
    });
    $body.iziModal({
      //autoOpen: true,
      autofocus: false,
      fullscreen: false,
      headerColor: '#794a5e',
      title: 'Шаг 2',
      subtitle: 'Расскажите о себе',
      icon: '.icon .icon__logo',
      zindex: 2000,
      /*onClosed: function(){
        $(this).iziModal('destroy');
        $body.remove();
      }*/
    });
  }

  /**
   * Возвратить объект в котором собраны все данные о пользователе
   * @return {{lastName, firstName, phone, email}}
   */
  this.getData = function(){
    return {
      lastName: $body.find('[name="lastName"]').val(),
      firstName: $body.find('[name="firstName"]').val(),
      phone: $body.find('[name="phone"]').val(),
      email: $body.find('[name="email"]').val()
    }
  };


  /**
   * Установить данные формы
   * @param {string} lastName - фамилия
   * @param {string} firstName - имя
   * @param {string} phone - номер телефона
   * @param {string} email - адрес электронной почты
   */
  this.setData = function({lastName='',firstName='',phone='',email=''}){
    $body.find('[name="lastName"]').val(lastName);
    $body.find('[name="firstName"]').val(firstName);
    $body.find('[name="phone"]').val(phone);
    $body.find('[name="email"]').val(email);
  };


  /**
   * Вызвать iziModal
   */
  this.show = function(){
    $body.iziModal('open')
  };


  /**
   * Немедленное построение модального окна при создании экземпляра класса
   * @constructor
   */
  (function(){
    render();
  })()
}
/**
 * Продукт
 * @params  {{}}     params
 * @param   {number} params.id              - ИД продукта
 * @param   {string} params.thumb           - ссылка на главное изображение продукта
 * @param   {string} params.href            - ссылка на страницу обзора товара
 * @param   {object} params.productContainer - родительский контейнер
 * @param   {number} params.gridSize        - размер сетки товаров
 * @param   {[]}     params.tagList         - список тегов
 * @param   {string} params.name            - наименование продукта
 * @param   {string} params.description     - описание продукта
 * @param   {[]}     params.overviewImages  - список изображений товара
 * @param   {string} params.settingFile     - наименование файла (объекта в window) настроек
 * @constructor
 */
function Product(params){
  var idProduct       = params.id,
      thumb           = params.thumb || "...",
      linkToCard      = params.href ||"#",
      container       = params.productContainer,
      gridSize        = params.gridSize || null,
      tagList         = params.tagList || [],
      name            = params.name || "Lorem ipsum",
      description     = params.description || "",
      overviewImages  = params.overviewImages,
      settingFile     = params.settingFile,
      hidden          = false,
      body,
      self            = this,
      onClickFn       = function(){
        new ProductReview({
          container: linkToCard,
          id: idProduct,
          thumb: thumb,
          name: name,
          description: description,
          imageList: overviewImages,
          settingFile :settingFile
        });
      };

  /**
   * Отрисовать продукт если указан родительский элемент
   */
  this.render = function(){
    if(!container){
      console.warn("Product::container is not defined");
      return false;
    }

    gridSize = gridSize ? '-sm-'+gridSize : '-12';

    body = $('<div/>',{
      class: "tetragon"+gridSize+" stock__product p-1",
      id: "product__"+idProduct,
      click: onClickFn}).append(
        $('<div/>',{class: 'tetragon__wrapper'}).append(
          $('<div/>',{class: 'tetragon__content'}).append(
            $('<img/>',{
              class: 'product__thumb d-block h-100 w-100',
              src: 'img/pre-loader.gif',
              'data-src': thumb,
              alt: name,
              error: $(this).addClass('invalid-image-src')}),
            $('<div/>',{class: 'product__description'}).append(
              $('<h2/>',{text: name}),
              $('<p/>',{class: 'text-nowrap text-truncate', text: description})
            )
          )
        )
      );
    body.appendTo(container);
  };

  this.removeLazyLoad = function () {
    var $a = $(body).find('img');
    var b = $a.attr('data-src');
    $a.attr('src',b);
  };

  /**
   * Скрыть блок
   */
  this.hide = function(){
    if( !body )
      return;
    hidden = true;
    body.addClass("sort__hide animated flipOutY");
  };

  /**
   * Отобразить блок
   */
  this.show = function(){
    if( !body )
      return;
    hidden = false;
    body.removeClass('sort__hide animated flipOutY')
      .addClass("sort__show animated flipInY");
    setTimeout(function(){
      body.removeClass("sort__show animated flipInY")
    },500);
  };

  /**
   * Проверить существования тега в списке тегов
   * @param tagName
   * @returns {boolean}
   */
  this.hasTag = function (tagName) {
    //console.log(tagName,name);
    return tagList.indexOf(tagName) !== -1;
  };

  /**
   * Проверить скрыт ли компонент
   * @return {boolean}
   */
  this.isHidden = function(){
    return hidden;
  };

  this.getImage = function(){
    return thumb
  };

  this.getName = function(){
    return name;
  };

  this.getDescription = function(){
    return description;
  };

  /**
   * Возвратить указатель на элемент в дереве объектов
   * @returns {*}
   */
  this.getBody = function(){
    return body;
  };

  /**
   * Возвратить список тегов
   * @returns {*|Array}
   */
  this.getTagList = function(){
    return tagList
  };

  (function(){
    self.render();
  })()
}


/**
 * Обзор продукта
 * @param params
 * @constructor
 */
function ProductReview(params){
  let container               = params.container,
    id                        = params.id,
    name                      = params.name,
    description               = params.description,
    thumb                     = params.thumb,
    imageList                 = params.imageList || null,
    settingFile               = params.settingFile,
    self                      = this,
    showGalleryOfThumbnails   = true,
    thumbnailsCaption         = '',
    note                      = '',
    minimumOrder              = 1,
    cost                      = 1,
    min                       = 1,
    max                       = 7,
    step                      = 1,
    weight                    = 0.50,
    ration                    = 3,
    breakpoints               = [],
    noOptions                 = false,
    tasteList                 = null,
    decorCaption              = null,
    decorList                 = null,
    sizeList                  = null,
    $body,
    adStuffingList            = null,
    orderCompletion           = null;

  function render() {
    $body = $('<div/>',{class: 'vnl_modal__product-review'}).append(
        $('<div/>',{class: 'product-review py-5 px-3'}).append(
          $('<form/>',{class: 'product-review__form'}).append(
            $('<div/>',{class:'row'}).append(
              addSection('product-review__gallery', addButtonGroup),
              addSection('product-review__info','')
            )//end row
          ),//end form
          ComponentRecommendedProducts({
            productId               : id,
            caption                 : 'C этим товаром так же покупают'
          })//end recommended products block
        )//end product-review
      );//end vnl_modal__product-review
    $body.appendTo('body');
    $body.iziModal({
      headerColor:common.primaryColor,
      title: name,
      subtitle: (description.length > 100 ? description.substr(0,100) + '...' : description),
      fullscreen: true,
      autoOpen: true,
      width: 1200,
      onClosed: function(){
        $(this).iziModal('destroy');
        $body.remove();
      }
    });

    new ReviewGallery({
      container               : $body.find('.product-review__gallery').find('.container-fluid') ,
      id                      : id,
      thumb                   : thumb,
      name                    : name,
      imageList               : imageList,
      showGalleryOfThumbnails : showGalleryOfThumbnails,
      thumbnailsCaption       : thumbnailsCaption,
    });
    new ReviewInfo({
      container               : $body.find('.product-review__info').find('.container-fluid') ,
      id                      : id,
      name                    : name,
      description             : description,
      minimumOrder            : minimumOrder,
      cost                    : cost,
      min                     : min,
      max                     : max,
      step                    : step,
      weight                  : weight,
      ration                  : ration,
      note                    : note,
      noOptions               : noOptions,
      breakpoints             : breakpoints,
      tasteList               : tasteList,
      decorCaption            : decorCaption,
      decorList               : decorList,
      sizeList                : sizeList,
      adStuffingList          : adStuffingList,
      orderCompletion         : orderCompletion,
      //TODO варианты исполнения : торт|трайфлы
    });

    $('body').off('orderClosed').on('orderClosed',function(e,personData,orderData){
      sendOrderData(personData,orderData);
    });
  }


  /**
   * Считать файл настроек и определить переменные
   */
  function readSettings(){
    let o;
    if( settingFile in window.setting )
      o = window.setting[settingFile];
      showGalleryOfThumbnails = ( 'showGalleryOfThumbnails' in o ) ? o.showGalleryOfThumbnails : true;
      thumbnailsCaption       = ( 'thumbnailsCaption'       in o ) ? o.thumbnailsCaption : '';
      note                    = ( 'note'                    in o ) ? o.note : '';
      minimumOrder            = ( 'minimumOrder'            in o ) ? o.minimumOrder: '1 шт.';
      cost                    = ( 'cost'                    in o ) ? o.cost : 1;
      min                     = ( 'min'                     in o ) ? o.min : 1;
      max                     = ( 'max'                     in o ) ? o.max : 7;
      step                    = ( 'step'                    in o ) ? o.step : 1;
      weight                  = ( 'weight'                  in o ) ? o.weight : 0.50;
      ration                  = ( 'ration'                  in o ) ? o.ration : 3;
      tasteList               = ( 'tasteList'               in o ) ? o.tasteList : null;
      decorCaption            = ( 'decorCaption'            in o ) ? o.decorCaption : null;
      decorList               = ( 'decorList'               in o ) ? o.decorList : null;
      sizeList                = ( 'sizeList'                in o ) ? o.sizeList : null;
      adStuffingList          = ( 'additionalStuffingList'  in o ) ? o.additionalStuffingList : null;
      breakpoints             = ( 'breakpoints'             in o ) ? o.breakpoints : [];
      noOptions               = ( 'noOptions'               in o ) ? o.noOptions : false;
      orderCompletion         = ( 'orderCompletionModal'    in o ) ? o.orderCompletionModal : null;
  }


  /**
   * Добавить раздел
   * @param {string}   sectionName - наименование раздела
   * @param {function} innerBody   - контент
   * @return {*|jQuery}
   */
  function addSection(sectionName,innerBody){
    if( !innerBody || typeof innerBody !== 'function' )
      innerBody = function(){};

    return $('<div/>',{class:'col-md ' + sectionName}).append(
      $('<div/>',{class:'container-fluid'}),
      innerBody()
    )
  }


  /**
   * Добавить группу кнопок с триггерами модальных окон
   * @return {*|jQuery}
   */
  function addButtonGroup(){
    return $('<div/>',{class:'card__btn-group'}).append(
      $('<div/>',{class:'btn-group w-100 px-3', role:'group', 'aria-label':'OtherOptions'}).append(
        addModalTrigger('Оформление', "#decorate-modal-open", ""),
        addModalTrigger('Вопросы', "#faq-modal-open", 'mx-1'),
        addModalTrigger('Вес', "#delivery-modal-open", "")
      )
    )
  }


  /**
   * Добавить триггер для открытия модали
   * @param {string} title      - наименоваие кнопки
   * @param {string} modalName  - ИД модального блока
   * @param {string} className  - Дополнительный класс для кнопки
   * @return {*|jQuery|HTMLElement}
   */
  function addModalTrigger(title,modalName, className){
    return $('<div/>',{
      href: '#',
      class: 'btn btn-outline-primary w-100 ' + className,
      'data-izimodal-open': modalName,
      'data-izimodal-zindex':"20000",
      'data-izimodal-preventclose':"",
      text: title
    })
  }


  /**
   * Отправить данные заказа на сервер
   * @param {[]} person - данные по клиенту
   * @param {[]} order  - данные по заказу
   */
  function sendOrderData(person,order){
    $.post('./core/orderController.php',
      {
        personData:JSON.stringify(person),
        orderData:JSON.stringify(order)
      },
      function (data){
        new OrderConfirmationModal({
          content: data
        })
      })
  }


  /**
   * @constructor
   */
  (function(){
    readSettings();
    render();
    $('body').trigger('productOpen');
  })()
}

/**
 *
 * @param params
 * @constructor
 */
function RangeSlider(params){
  var container = params.rangeSliderContainer,
    index           = params.index || "",
    name            = params.name || 'slider',
    caption         = params.caption || '',
    prodInRation    = params.productsInRation || 3,  //количество единиц продуктав одной порции
    minRangeValue   =  params.min || 1,             //минимально возвожное количество единиц продукции для заявки
    maxRangeValue   = params.max || 7,              //максимально возможное количество
    rangeStepValue  = params.step || 1,            //шаг слайдера
    weight          = params.weight < 1 ? params.weight*1000 : params.weight,
    units           = params.weight < 1 ? 'гр' : 'кг' || '',
    $range,$count,$rations,body,$value,
    self = this,
    bpController,
    currentValue,
    breakpoints     = params.breakpoints || null;

  function isBreakpointsDefine(){
    return breakpoints && breakpoints.length >= 1
  }

  /**
   * Отрисовать компонент
   */
  this.render = function(){
    container.empty();
    if( !isBreakpointsDefine() )
      units = 'шт.';

    var breakpointContainer = (breakpoints && breakpoints.length !== 0) ? '<div id="breakpoint__container"></div>' : '';
    caption = caption ? '<input class="range__caption" data-taste-name="' +caption+ '" value="' +caption+ '"/>' : "";

    body = $(
      '<div id="' +index+ '" class="row range">' +
      ' <div class="col-12 range__caption-container">' +
        caption +
      ' </div>' +
      ' <div class="col-2 d-flex align-items-end">' +
      '   <div class="w-100">' +
      '     <input readonly="readonly" name="' +name+ '__weight" class="range__count w-100"/>' +
      '     <div class="text-center">' +units+ '</div>' +
      '   </div>' +
      ' </div>' +
      ' <div class="col-8 p-0 pb-4">' +
          breakpointContainer +
      '   <input type="range" class="html-input-range ' +index+ '">' +
      '   <input type="hidden" name="' +name+ '" class="range__value"/>' +
      ' </div>' +
      ' <div class="col-2 d-flex align-items-end">' +
      '   <div  class="w-100">' +
      '     <input readonly="readonly" name="' +name+ '__rations" class="range__ration-count w-100"/>' +
      '     <div class="text-center " style="white-space: nowrap">порций</div>' +
      '   </div>' +
      ' </div>' +
      '</div>').insertAfter(container);

    $range = $(body).find('.html-input-range');
    $count = $(body).find('.range__count');
    $value = $(body).find('.range__value');
    $rations = $(body).find('.range__ration-count');
    if(breakpoints)
      bpController = new BreakPointContainer(breakpoints,self);

    $range.ionRangeSlider({
      max: maxRangeValue,
      min: minRangeValue,
      from: 1,
      hide_min_max: true,
      hide_from_to: true,
      grid: false,
      type: 'single',
      step: rangeStepValue,
      force_edges: true,
      grid_snap: true,
      hide_values: true,
      onStart: init,
      onChange: track
    });
  };

  /**
   * Разместить точки прерывания на шкале слайдера
   * и установить стартовое значение слайдера
   * @param data
   */
  function init(data){
    if(breakpoints)
      bpController.init();
    track(data)
  }

  /**
   * Отслеживать значение слайдера
   * @param data
   */
  function track (data) {
    currentValue = data.from;
    $value.val(data.from);
    if( isBreakpointsDefine() )
      $count.val(data.from*weight);
    else
      $count.val(data.from);
    $rations.val( Math.ceil(data.from / prodInRation) );
    if(breakpoints)
      bpController.selectAllbreakpointsLessThanValue(data.from)
  }

  this.minRangeValue = function () {
    return minRangeValue
  };

  this.maxRangeValue = function () {
    return maxRangeValue
  };

  this.rangeStepValue = function () {
    return rangeStepValue
  };

  this.getBreakpointContainer = function(){
    return $(body).find('#breakpoint__container')
  };

  this.getSliderReport = function(){
    return {
      tier: bpController.getActiveBreakpointsCount(),
      count: currentValue,
      totalWeight: $count.text(),
      rations: $rations.text()
    }
  };

  function Breakpoint(_$container,icon,leftOffset,className) {
    var $container = _$container,
      $body,
      self = this;

    this.render = function(){
      $body = $('<div/>',{
        class: "breakpoint " + (className ? className : 'default'),
        style:"left:"+leftOffset})
        .append(
          $('<div/>',{class:'breakpoint__line'}),
          icon
        );
      $body.appendTo($container)
    };

    this.isActive = function(){
      return $body.hasClass('active')
    };

    this.activate = function(){
      $body.addClass('active')
    };

    this.deactivate = function(){
      $body.removeClass('active')
    };

    (function(){
      self.render();
    })()
  }

  function BreakPointContainer(arrayOfValues,parent){
    var selfContainer = parent.getBreakpointContainer(),
      breakPointArray = [],
      breakPointValuesArray = arrayOfValues || [],
      self = this;

    this.getActiveBreakpointsCount = function(){
      var count = 0;
      breakPointArray.forEach(function (item) {
        if( item.isActive() )
          count ++;
      });
      return count;
    };

    this.createBP = function(icon,offsetLeft,className){
      if(!offsetLeft) return false;
      breakPointArray.push(
        new Breakpoint(selfContainer,icon,offsetLeft,className)
      )
    };

    this.init = function() {
      var className = '';
      breakPointValuesArray.forEach(function (item) {
        className = 'default';
        if('className' in item)
         className = item.className;
        self.createBP( item.icon,getOffsetInPercent(item.value),className )
      });
    };

    this.selectAllbreakpointsLessThanValue = function(value){
      breakPointValuesArray.forEach(function (item,i) {
        if( value >= item.value )
          breakPointArray[i].activate();
        else
          breakPointArray[i].deactivate();
      })
    };

    this.deselectAllbreakpoints = function(){
      breakPointArray.forEach(function(breakpoint){
        breakpoint.deactivate();
      });
    };

    function getOffsetInPercent(brPoint){
      var oneStep;
      var total = parent.maxRangeValue() - parent.minRangeValue();
      if (total > 50)
        oneStep = +(parent.rangeStepValue() / 0.5).toFixed(20);
      else
        oneStep = +(parent.rangeStepValue()/ (total / 100)).toFixed(20);
      var offset = +( oneStep * (brPoint-1) /* (brPoint-32-2)*/ ).toFixed(20);
      return offset + '%'
    }
  }

  (function(){
    self.render();
  })()
}
/**
 * Галлерея изображений в обзоре товара
 * @params {object} params
 * @param  {object} params.container
 * @param  {number} params.id         - ИД продукта
 * @param  {string} params.thumb      - ссылка на главное изображение товара
 * @param  {string} params.name       - наименование товара
 * @param  {[]}     params.imageList  - список дополнительных изображений товара
 * @constructor
 */
function ReviewGallery(params){
  let container             = params.container,
    id                      = params.id,
    showGalleryOfThumbnails = params.showGalleryOfThumbnails || true,
    thumbnailsCaption       = params.thumbnailsCaption,
    thumb                   = params.thumb,
    name                    = params.name || "mini-gallery",
    imageList               = params.imageList || [],
    self                    = this,
    body;


  /**
   * Создать контейнер для изображения
   * @param src       - путь к изображению
   * @param className - кастомный класс для контейнера
   * @return {void|*|jQuery}
   */
  function image(src,className){
    return $('<a/>',{
      class: "stock__product "+ className,
      id: "product__"+id,
      href: src,
      'data-toggle':'lightbox',
      'data-gallery': name + '-' + id,
      'data-width': '800px',
      'data-height':'800px',
    })
      .append(
        $('<div/>',{class:'tetragon-12'})
          .append(
            $('<div/>',{class: 'tetragon__wrapper'})
              .append(
                $('<div/>',{class: 'tetragon__content'})
                  .append(
                    $('<img/>', {
                      src: src,
                      alt: name,
                      'onerror': '$(this).addClass("invalid-image-src")',
                      class: 'product__thumb d-block h-100 w-100',
                    })
                  )
              )
          )
      )
  }


  /**
   * Добавить галлерею миниатюр. Сетка 3*n изображений.
   * При каждом создании галлереи изображения перемешиваются в рандомном порядке
   * Если указан параметр <strong>showGalleryOfThumbnails = false</strong> галлерея не будет выводится
   * @return {boolean|jQuery}
   */
  function galleryOfThumbnails(){
    if(!showGalleryOfThumbnails) return false;
    imageList = common.randomizeArray(imageList);
    var $a = $('<div/>',{class:'row gallery-of-thumbnails p-3'})
      .append(
        $('<h4/>',{text:thumbnailsCaption,class:'d-block w-100'})
      );
    for(var i=0;i<4;i++){
      $a.append(
        image(imageList[i].thumb,'col-3 p-1')
      )
    }
    return $a;
  }


  /**
   * Отрисовать компонент
   */
  function render(){
    body = $('<div/>',{class:'product-review__gallery-content mb-4'})
      .append(
        $('<div/>',{class:'row product-review__primary-gallery'})
          .append(
            image(thumb,'col-12')
          ),
        $('<div/>',{class:'product-review__secondary-gallery w-100'})
          .append(
            galleryOfThumbnails()
          )
      );
    $(container).empty(); //очистим контейнер чтобы избежать дублирования
    body.appendTo(container);
    body.on('click', '[data-toggle="lightbox"]', function(event) {
      event.preventDefault();
      $(this).ekkoLightbox({
        onHidden: function() {
          //$('body').addClass('modal-open');
        },
      });
    });
  }

  (function(){
    render();
  })()
}
/**
 * Информация о товаре
 * @params {object} params
 * @constructor
 */
function ReviewInfo(params){
  let container     = params.container,
    id              = params.id,
    name            = params.name,
    description     = params.description,
    minimumOrder    = params.minimumOrder,
    cost            = params.cost,
    note            = params.note,
    step            = params.step,
    weight          = params.weight,
    min             = params.min,
    max             = params.max,
    ration          = params.ration,
    tasteList       = params.tasteList || null,
    decorCaption    = params.decorCaption,
    decorList       = params.decorList || null,
    sizeList        = params.sizeList  || null,
    adStuffingList  = params.adStuffingList || null,
    orderCompletion = params.orderCompletion || null,
    breakpoints     = params.breakpoints,
    noOptions       = params.noOptions,
    sliderOpt       = {
      index: id,
      caption: '',
      productsInRation: ration,
      min: min,
      max: max,
      step: step,
      weight: weight,
      breakpoints: breakpoints
    },
    variantsOfExecution= params.variantsOfExecution || false,
    optionsList = [],
    body,
    personModal,
    slider;

  /**
   * Добавить строку характеристики продукта
   * @param {string}  fieldName   - имя поля для отправки
   * @param {string}  className   - дополнительный класс
   * @param {string}  text        - наименование характеристики
   * @param {boolean} isSeparated - флаг определяющий требуется ли показывать нижнюю границу под характеристикой
   * @return {*|void|jQuery}
   */
  function featureRow(fieldName,className,text,isSeparated){
    var bordered =  isSeparated === true ? ' border-bottom text-right' : '';
    return $('<div/>',{class:'row'})
      .append(
        $('<div/>',{class:'col-12 '+className+'-container' + bordered})
          .append(
            $('<span/>',{
              class:className,
              text:text,
              name: fieldName})
          )
      )
  }


  /**
   * Добавить строку опций товара
   * @param className
   */
  function addOrderOptionRow(className){
    $('<div/>',{class: 'product-review__order-option '+className+' mt-3'}).appendTo(body)
  }

  function render(){

    body = $('<div/>',{id: id,class: 'product-review__info-content'})
      .append(
        featureRow('name','product-review__name', name, true ),
        featureRow('description','product-review__description !product-review__min-height pb-5', description ),
        featureRow('minOrder', 'product-review__minimum-order ','Минимальный заказ: ' + minimumOrder  ),
        featureRow('minCost', 'product-review__cost', 'Цена за 1 ' + ( minimumOrder.split(' ')[1] ? minimumOrder.split(' ')[1] : ' кусок' ) + ' от '+cost+' BYN' ),
      );

    $(container).empty();
    body.appendTo(container);

    personModal = new PersonCardModal({
      container: body
    });
    $('body').off('personModalClosed').on('personModalClosed',function(e,d){
      console.log(e,d);
      $('body').trigger('orderClosed',[d,collectAllData()]);
    });
    //Если указаны вкусы :: создать компонент "Выбор вкуса"
    if( isTastesSpecified() ){
      optionsList.push(
        addComponentTasteSelect()
      );
    }
    //Если указаны дополнения к начинке :: создать компонент "Дополнения к начинке"
    if( isAdditionalStuffingSpecified() ){
      optionsList.push(
        addComponentAdditionalStuffingSelect()
      )
    }
    //Если указаны варианты декора :: создать компонент "Оформления"
    if( isDecorSpecified() ){
      optionsList.push(
        addComponentDecorSelect()
      )
    }
    //Если указаны варианты размеров :: создать компонент "Размеры"
    if( isSizesSpecified() ){
      optionsList.push(
        addComponentSizeSelect()
      )
    }
    //Создать компонент "Комментарии"
    optionsList.push(
      addComponentNotification()
    );
    //Создать компонент "Изображения"
    optionsList.push(
      addComponentImage()
    );
    //Создать кнопку "Оформить заявку"
    addTotalButton();
    //Создать компонент "Рекомендуемые товары"
    addComponentRecommendedProduct();
  }


  /**
   * Проверить указаны ли варианты выбора вкуса
   * @return {boolean}
   */
  function isTastesSpecified(){
    return !!tasteList && typeof tasteList === 'object' && tasteList.length !== 0
  }


  /**
   * Добавить компонент выбора вкусов
   * @return {ComponentTaste}
   */
  function addComponentTasteSelect(){
    addOrderOptionRow("option__choose-taste");
    return new ComponentTaste({
      container: body.find(".option__choose-taste"),
      productId: id,
      tasteList: tasteList,
      sliderOpt: sliderOpt
    });
  }


  /**
   * Проверить указаны ли варианты выбора оформления
   * @return {boolean}
   */
  function isDecorSpecified(){
    return !!decorList && typeof decorList === "object" && decorList.length !== 0
  }


  /**
   * Добавить компонент для выбора вариантов оформления
   * @return {ComponentDecor}
   */
  function addComponentDecorSelect(){
    addOrderOptionRow("option__choose-decor");
    return new ComponentDecor({
      container: body.find('.option__choose-decor'),
      productId: id,
      decorList: decorList,
      caption  : decorCaption
    })
  }


  /**
   * Проверить указаны ли варианты выбора дополнения к начинке
   * @returns {boolean}
   */
  function isAdditionalStuffingSpecified(){
    return !!adStuffingList && typeof adStuffingList === 'object' && adStuffingList.length !== 0
  }


  /**
   * Добавить компонент для выбора дополнения в начинке
   * @returns {ComponentAdditionalStuffing}
   */
  function addComponentAdditionalStuffingSelect(){
    addOrderOptionRow('option__choose-additionalStuffing');
    return new ComponentAdditionalStuffing({
      container: body.find('.option__choose-additionalStuffing'),
      productId: id,
      additionalStuffingList: adStuffingList
    })
  }


  /**
   * Проверить указаны ли раз
   * @returns {boolean}
   */
  function isSizesSpecified(){
    return !!sizeList && typeof sizeList === "object" && sizeList.length !== 0
  }


  /**
   * Добавить компонент для выбора размера готового продукта
   * @returns {ComponentSize}
   */
  function addComponentSizeSelect(){
    addOrderOptionRow('option__choose-size');
    return new ComponentSize({
      container: body.find('.option__choose-size'),
      productId: id,
      sizeList: sizeList
    })
  }


  /**
   * Добавить компонент для ввода комментария
   * @returns {ComponentNotification}
   */
  function addComponentNotification(){
    addOrderOptionRow('option__notification');
    return new ComponentNotification({
      container: body.find('.option__notification'),
      productId: id,
      text: note
    })
  }


  /**
   * Добавить компонент для заргузки изображения
   * @returns {ComponentImage}
   */
  function addComponentImage(){
    return new ComponentImage({
      container: body.closest('.product-review__form'),
      productId: id
    })
  }


  /**
   * Добавить компонент рекомендуемых продуктов
   */
  function addComponentRecommendedProduct() {
    $('<div/>',{class:'mt-5'})
      .append(
        new ComponentRecommendedProducts({
          container: body.closest('.product-review__form'),
          productId: id,
          caption: 'С этим продуктом покупают'
        })
      );
  }


  /**
   * Добавить кнопку "Оформить заявку" при нежатии на котрую будет собираться вся инфа по выделенным
   * опциям заявки и записываться в поле с name="total"
   */
  function addTotalButton() {
    $('<div/>',{class: 'row product-review__total mt-5'})
      .append(
        $('<input/>',{type:'hidden',name:'total'}),
        $('<div/>',{class:'col-12 d-flex justify-content-center'})
          .append(
            $('<a/>',{
              id: 'send-to-next',
              href: '#',
              class: 'btn btn-outline-primary p-4',
              text: 'Оформить заявку',
              click: function(){
                console.log(collectAllData());
                personModal.show();
              }
            })
          )
      )
      .appendTo( body.closest('.product-review__form') );
  }


  /**
   * Собрать данные всех компонентов
   * @return {string}
   */
  function collectAllData(){
    var a = {};
    optionsList.forEach( item => {
      if(item) {
        a[item.constructor.name] = item.getData();
      }
    });
    return a;
  }


  /**
   * Немедленное построение компонента
   */
  (function(){
    render();
  })()
}
/**
 * Витрина
 * @param params
 * @constructor
 */
function Showcase(params){
  var container = params.showcaseContainer,
    gridSize = parseInt( (12/params.gridSize),10 ) || 4,
    self = this,
    uniqTags = new Tags(),
    navbar,
    body,
    categories = [];

  this.addRange = function(list){
    if(typeof list === "string")
      list = JSON.parse(list);

    list.forEach(function(src,i){
      uniqTags.add(src.categoryName);
      categories.push(
        new Category({
          categoryContainer: container,
          gridSize: ( list.length < gridSize && src.products.length ===1 ) ? null : gridSize,
          categoryId: src.categoryId,
          categoryName: src.categoryName,
          products: ("products" in src) ? src.products : null,
          galleryPath: src.galleryPath,
          settingFile: src.categorySettings
        })
      );
    });

    navbar = new NavbarBlock({
      container: $('.navbar__primary'),
      source: uniqTags.getTagList(),
      itemList: categories
    })
  }
}

/**
 * Уникальные теги
 * @class
 */
function Tags(){
  var tagsList = [],
    self = this;


  /**
   * Выделить уникальные теги
   * @param source - список тегов в товаре
   * @returns {boolean}
   */
  this.explore = function(source){
    if(!source) return false;

    source.forEach(function(item,i){
      if(!isExistedInList(tagsList,item))
        tagsList.push(item);
    })
  };


  /**
   * Возвратить список уникальных тегов
   * @returns {Array}
   */
  this.getTagList = function(){
    return tagsList;
  };

  /**
   * Добавить элемент в коллекцию
   * @param {*} item - элемент
   */
  this.add = function (item) {
    tagsList.push(item);
  };

  /**
   * Сортировать список продуктов по ключу (тэгу)
   * @param {string} tag - тэг
   */
  this.sortByTag = function(tag){
    self.flushSort();
    tagsList.forEach(function(item,i){
      if( !item.hasTag(tag) )
        item.hide();
      else
        item.removeLazyLoad()
    })
  };


  /**
   * Сбросить сортировку списка продуктов
   */
  this.flushSort = function(){
    tagsList.forEach(function(item,i){
      item.show()
    })
  };


  /**
   * Проверить существование элемента в массиве
   * @param {[]} itemList - массив элементов
   * @param {string} itemName - искомый элемент
   * @returns {boolean}
   */
  function isExistedInList(itemList,itemName){
    return itemList.indexOf(itemName) !== -1;
  }

}


function NavbarBlock(params){
  var container = $(params.container),
      itemList = params.itemList,
      source = params.source,
      selectedTags = [],
      body,
      self = this,
      sortByTag = function(){
        if( $(this).hasClass('active') ) {
          $(this).removeClass('active');
          var thisTag = $(this).attr('data-target');
          selectedTags.remove(thisTag);
          self.sortByTagList();
          //self.clearSort();
          //flushSelection();
        }else {
          //flushSelection();
          selectedTags.push( $(this).attr('data-target') );
          self.sortByTag( $(this).attr('data-target') );
          $(this).addClass('active')
        }
      },
      flushAll = function(){
        self.clearSort();
        flushSelection();
        selectedTags = [];
      };

  /**
   * Отрисовать элемент
   */
  function render() {
    var firstCol  = column('nav-tags__column col-6 col-sm');
    var secondCol = column('nav-tags__column col-6 col-sm');
    var thirdCol  = column('nav-tags__column col-12 col-sm');
    var fourthCol = column('nav-tags__column col-6 col-sm');
    var fifthCol  = column('nav-tags__column col-6 col-sm');
    var itr = 1;
    source.forEach(function (item) {
      if( itr === 1 ) firstCol.append( tagButton(item) );
      if( itr === 2 ) secondCol.append( tagButton(item) );
      if( itr === 3 ) fourthCol.append( tagButton(item) );
      if( itr === 4 ) fifthCol.append( tagButton(item) );

      if(itr === 4 ) itr = 1;
      else itr ++
    });

    thirdCol.append( flushButton('Все'));

    body = $('<div/>',{id:"taglist__primary",class:'row w-100'})
          .append(
            firstCol,
            secondCol,
            thirdCol,
            fourthCol,
            fifthCol
          );

    body.appendTo(container)
  }

  function column(className){
    return $('<div/>',{
      style:'flex-wrap:wrap',
      class:'d-flex flex-row d-sm-block p-0 ' + className})
  }


  function tagButton(target){
    return $('<a/>',{
      class: 'btn btn-link nav-tags__item p-0',
      href: '#',
      'data-target': target,
      text: target,
      click: sortByTag
    })
  }

  function flushButton(text){
    return $('<a/>',{
      class: 'btn btn-link nav-tags__item nav-tags__item_primary',
      href: '#',
      'data-target': 'flush',
      text: text,
      click: flushAll
    })
  }


  /**
   * Сборсить выделение с активных тегов
   */
  function flushSelection(){
    $('.nav-tags__item.active').removeClass('active');
  }


  /**
   * Сортировка по тэгу
   * Скрыть все товары без заданного тега
   * @param tag
   */
  this.sortByTag = function(tag){
    //self.clearSort();
    var countOfItemsWithTag = 0;
    itemList.forEach(function(item,i){
      if( !item.hasTag(tag) )
        item.hide();
      else if( !item.isHidden() ){
        countOfItemsWithTag ++;
        item.removeLazyLoad();
      }
    });
    if( countOfItemsWithTag === 0 ){
      $('.null-result').remove();
      $('<h2/>',{class:'null-result text-center p-5 w-100',style:'border: 1px dashed ' +common.primaryColor,text:'По комбинации тегов "' + selectedTags.join(' + ') + '" нет совпадений'})
        .appendTo('.vnl__gallery,.vnl__showcase')
    } else {
      $('.null-result').remove()
    }
  };


  /**
   * Сортировка по списку тегов
   */
  this.sortByTagList = function(){
    self.clearSort();
    selectedTags.forEach(function(tag){
      self.sortByTag(tag)
    });
  };


  /**
   * Очистить сортировку
   */
  this.clearSort = function(){
    itemList.forEach(function(item,i){
      item.show()
    })
  };

  (function () {
    render()
  })()
}

/**
 * Компонент для отображения списка дополнений к начинке для продукта в заявке
 * @params {object} params
 * @param {object}  params.container  - контейнер для вставки компонента
 * @param {number}  params.productId  - ИД продукта
 * @param {[]}      params.additionalStuffingList - список дополнений к начинке
 * @author skipperTeam
 * @constructor
 */
function ComponentAdditionalStuffing(params) {
  var container           = params.container,
    productId             = params.productId,
    additionalStuffingList= params.additionalStuffingList,
    $body       = '',
    counter     = 1;

  /**
   * Создать элемент выбора дополнения к начинке
   * @param {string} name - название элемента
   * @returns {*|void|jQuery}
   */
  function createStuffingItem(name) {
    return $('<div/>',{class:"custom-control custom-checkbox"})
      .append(
        $('<input/>',{
          type: 'checkbox',
          class: 'custom-control-input',
          id: 'checkbox-ads-'+productId+''+counter,
          value: name
        }),
        $('<label/>',{
          class: 'custom-control-label',
          for: 'checkbox-ads-'+productId+''+counter ++,
          text: name
        })
      )
  }


  /**
   * Отрисовать компонент
   */
  function render(){
    $body = $('<div/>',{class:'product-review__additionalStuffing-container'})
      .append(
        $('<span/>',{text: 'Укажите дополнения к начинке'}),
        $('<hr>')
      );
    additionalStuffingList.forEach(function(stuff,i){
      $body.append( createStuffingItem(stuff.name) )
    });
    $body.appendTo(container);
  }

  /**
   * Возвратить выделенные данные
   * @returns {[]}
   */
  this.getData = function(){
    var additionalStuffingList = [];
    $body.find(':checkbox:checked').each(function(i,stuff){
      additionalStuffingList.push(
        $(stuff).attr('value')
      )
    });
    return additionalStuffingList;
  };

  /**
   * Установить данные
   * @param {[]} values
   */
  this.setData = function (values) {
    values.forEach(function(value){
      $('.custom-control-input').find('[value='+value+']')
        .attr('checked','checked')
    })
  };

  /**
   * Функция конструктор
   */
  (function(){
    render();
  })()
}
/**
 * Компонент для отображения списка декоров(оформлений) для продукта в заявке
 * @params {object} params
 * @param {object}  params.container
 * @param {number}  params.productId
 * @param {[]}      params.decorList
 * @param {string}  params.caption
 * @author skipperTeam
 * @constructor
 */
function ComponentDecor(params) {
  var container = params.container,
    productId   = params.productId,
    decorList   = params.decorList,
    caption     = params.caption,
    $body       = '',
    counter     = 1;

  /**
   * Создать элемент выбора оформления
   * @param name
   * @returns {*|void|jQuery}
   */
  function createDecorItem(name) {
    return $('<div/>',{class:"custom-control custom-checkbox"})
      .append(
        $('<input/>',{
          type: 'checkbox',
          class: 'custom-control-input',
          id: 'checkbox-dcr-'+productId+''+counter,
          value: name
        }),
        $('<label/>',{
          class: 'custom-control-label',
          for: 'checkbox-dcr-'+productId+''+counter++,
          text: name
        })
      )
  }

  /**
   * Отрисовать контейнер
   */
  function render(){
    var decorCaption = caption ? caption : 'Выберите вариант оформления';
    $body = $('<div/>',{class:'product-review__decor-container'})
      .append(
        $('<span/>',{text: decorCaption}),
        $('<hr>')
      );
    decorList.forEach(function(decor){
      $body.append( createDecorItem(decor.name) )
    });
    $body.appendTo(container);
  }

  /**
   * Возвратить список выбранных элементов оформления
   * @returns {[]}
   */
  this.getData = function(){
    var decorList = [];
    $body.find(':checkbox:checked').each(function(i,decor){
      decorList.push( $(decor).attr('value') )
    });
    return decorList;
  };

  /**
   * Установить данные
   * @param {[]} values
   */
  this.setData = function (values) {
    values.forEach(function(value){
      $('.custom-control-input').find('[value='+value+']')
        .attr('checked','checked')
    })
  };

  /**
   * Функция конструктор
   */
  (function(){
    render();
  })()
}
/**
 * Компонент для вставки|загрузки изображений
 * @param params
 * @params {object} params
 * @param  {object} params.container  - контейнер для размещения элемента
 * @param  {number} params.productId  - ИД продукта
 * @author skipperTeam
 * @constructor
 */
function ComponentImage(params){
  var container = params.container,
    productId   = params.productId,
    $body       = '',
    counter     = 0;

  function createImageItem(){
    counter ++;
    return $('<div/>',{class:'vnl-card__wrapper p-3 col-sm-4 animate bounceInUp'})
      .append(
        $('<div/>',{class:'card border-success product-review__image-upload '})
          .append(
            $('<span/>',{text:'Ваше изображение',class:'border-bottom text-center'}),
            $('<img/>',{
              class:'card-img-top bg-light border-bottom',
              style:'height: 180px;object-fit:contain;color: #f8f9fa;',
              alt: 'upload-image',
            }),
            $('<div/>',{class:'card-body pb-3'})
              .append(
                //TODO provide commentaries for image
                //$('<h5/>',{class: 'card-title',text:'Введите описание'}),
                //$('<textarea/>',{class: 'card-text w-100',rows:5}),
                $('<div/>',{class:'card-upload-type'})
                  .append(
                    createComponentUploadType()
                  )
              )
          )
      )
  }


  function createComponentUploadType(){
    return $('<div/>',{class:'image-container__controls my-3'})
      .append(
        $('<div/>',{class:"custom-control custom-radio"})
          .append(
            $('<input/>',{
              checked: 'checked',
              type: 'radio',
              id: 'control-radio'+counter+'__'+counter,
              class: 'custom-control-input',
              name: 'control-radio'+counter+'__'+counter,
              click: function(){
                $(this).closest('.image-container__controls').find('.ref-upload').show();
                $(this).closest('.image-container__controls').find('.img-upload').hide();
              }
            }),
            $('<label/>',{
              class: 'custom-control-label',
              for: 'control-radio'+counter+'__'+counter,
              text: 'Загрузить изображение по ссылке'
            })
          ),
        $('<div/>',{class:"custom-control custom-radio"})
          .append(
            $('<input/>',{
              type: 'radio',
              id: 'control-radio2'+counter+'__'+counter,
              class: 'custom-control-input',
              name: 'control-radio'+counter+'__'+counter,
              click: function(){
                $(this).closest('.image-container__controls').find('.img-upload').show();
                $(this).closest('.image-container__controls').find('.ref-upload').hide();
              }
            }),
            $('<label/>',{
              class: 'custom-control-label',
              for: 'control-radio2'+counter+'__'+counter,
              text: 'Загрузить изображение с диска'
            })
          ),
        $('<div/>')
          .append(
            $('<input/>',{
              class:'form-control w-100 ref-upload',
              id:'load-link__'+counter, //example http://api.jquery.com/jquery-wp-content/themes/jquery/content/donate.png
              type:'text',
              change: function(){
                $(this).closest('.card').find('.card-img-top').attr('src', $(this).val() );
              }
            }),
            $('<input/>',{
              class:'form-control w-100 img-upload border-0',
              id:'load-image__'+counter,
              type:'file',
              change: function (evt) {
                try {
                  let that = this,
                      files = evt.target.files;
                  if (!files[0].type.match('image.*')) {
                    console.warn('file type is not an image');
                    return
                  }
                  let reader = new FileReader();
                  reader.onload = (function (theFile) {
                    return function (e) {
                      $(that).closest('.card').find('.card-img-top').attr('src', e.target.result);
                    };
                  })(files[0]);
                  reader.readAsDataURL(files[0]);
                } catch (err) { console.warn(err) }
              },
              accept:"image/*,image/jpeg"})
          )
      )

  }

  /**
   * Отрисовать компонент
   */
  function render(){

    $body = $('<div/>',{class: 'row d-flex flex-row-reverse product-review__images-container mt-3'})
      .append(
        $('<div/>',{class:'col-12 image-container__preview text-center pb-3 border-bottom'})
          .append(
            $('<input/>',{
              class:'btn btn-outline-info mx-auto',
              type :'button',
              value:"Добавить больше изображений",
              click:function(){
                $(this).closest('.product-review__images-container').append(
                  createImageItem()
                );
                $body.find('.img-upload:last').hide()
              }
            })
          ),
        createImageItem()
      );

    $body.appendTo(container);
    $body.find('.img-upload').hide()
  }


  /**
   * Возвратить строку с изображением в формате data:image/png;base64
   * Вся магия происходит за счёт элемента <canvas/> в который мы загружаем
   * изображение
   * Если изображение по каким-то причинам не удалось обработать
   * (чаще всего из-за политики безопасности требующей разрешения кроссдоменного запроса)
   * то возвратить ссылку на изображение
   * !!!возможный вариант решения данной проблемы это создание собственного сервера
   * @param {object|string} item - изображение
   * @return {string}
   */
  function getBase64FromImageURL(item) {
    let result = $(item).attr('src'),
      canvas = $("<canvas/>", {class: '!d-none'}).appendTo('body'),
      img = document.createElement("img");
    img.src = result;
    img.onload = function() {
      canvas.width = $(item).outerWidth();
      canvas.height = $(item).outerHeight();
      var ctx = canvas.get(0).getContext("2d");
      try {
        ctx.drawImage($(item)[0], 0, 0);
        result = canvas.get(0).toDataURL("image/png");
      } catch (err) {
        console.warn(err);
      }
    };
    $(canvas).remove();
    return result;
  }

  function isUploadByLink(src){
    return (src.indexOf('://') > -1 || src.indexOf('img') > -1);
  }

  this.getData = function(){
    let rez = [];
    $body.find('.card-img-top').each(function(i,item){
      let src = $(item).attr('src') || '';
      if( !src ) return;
      if( !isUploadByLink(src) ) {
        src = getBase64FromImageURL(item);
        src = src.split(',');
        src = src[1];
      }
      rez.push(src)
    });
    return rez;
  };

  (function(){
    render()
  })()
}
/**
 * Компонент для отображения комментариев к заказу
 * @params {object} params
 * @param  {object} params.container  - контейнер для размещения элемента
 * @param  {number} params.productId  - ИД продукта
 * @param  {string} params.text       - текст для плейсхолдера элемента
 * @param  {string} params.title      - наименование блока
 * @author skipperTeam
 * @constructor
 */
function ComponentNotification(params){
  var container = params.container,
    productId   = params.productId,
    text        = params.text,
    title       = params.title || 'Дополнительные пожелания',
    $body       = '';

  /**
   * Отрисовать компонент
   */
  function render(){
    $body = $('<div/>',{class:'product-review__notification-container'})
      .append(
        $('<span/>',{text: title}),
        $('<hr/>'),
        $('<textarea/>',{
          id: 'notification-'+productId,
          name: 'notification',
          class: 'form-control w-100',
          placeholder: text,
          rows: 9
        })
      );
    $body.appendTo(container)
  }

  /**
   * Возвратить введённый комментарий к заказу
   */
  this.getData = function(){
    return $body.find('textarea').val();
  };

  /**
   * Установить комментарий к заказу
   * @param {string} value текст комментария
   */
  this.setData = function(value){
    $body.find('textarea').val(value);
  };

  /**
   * Функция конструктор
   */
  (function(){
    render();
  })()
}
/**
 * Компонент "рекомендуемые товары"
 * Cоздание блока с четырьмя раандомно выбранными из массива recommendedProducts товарами
 * @params {object} params
 * @param  {number} params.productId - ИД продукта
 * @param  {string} params.caption   - Наименование блока
 * @return {HTMLElement}
 * @constructor
 */
function ComponentRecommendedProducts(params){
  var productId = params.productId,
    caption     = params.caption,
    dir         = 'img/With_this_product_buy/',
    count       = 8,
    name        = 'With_this_product_buy',
    recArray    = [],
    $body       = '',
    recommendedProducts = [
      {
        thumb: dir + name + 1 + '.jpg',
        name : 'recommended product',
        link : 'gallery__dessert.html?goto=Cupcakes2'
      },
      {
        thumb: dir + name + 2 + '.jpg',
        name : 'recommended product',
        link : 'gallery__dessert.html?goto=Zephyr3'
      },
      {
        thumb: dir + name + 3 + '.jpg',
        name : 'recommended product',
        link : 'gallery__dessert.html?goto=type8'
      },
      {
        thumb: dir + name + 4 + '.jpg',
        name : 'recommended product',
        link : 'gallery__dessert.html?goto=type23'
      },
      {
        thumb: dir + name + 5 + '.jpg',
        name : 'recommended product',
        link : 'gallery__dessert.html?goto=cakepops2'
      },
      {
        thumb: dir + name + 6 + '.jpg',
        name : 'recommended product',
        link : 'gallery__dessert.html?goto=Marmalade2'
      },
      {
        thumb: dir + name + 7 + '.jpg',
        name : 'recommended product',
        link : 'gallery__dessert.html?goto=For_children5'
      },
      {
        thumb: dir + name + 8 + '.jpg',
        name : 'recommended product',
        link : 'gallery__dessert.html?goto=Zephyr1'
      }
    ];


  /**
   * Создать контейнер для изображения
   * @param src       - путь к изображению
   * @param className - кастомный класс для контейнера
   * @param link      - ссылка
   * @return {void|*|jQuery}
   */
  function image(src,className,link){
    return $('<a/>',{
      class: "stock__product "+ className,
      id: "product__"+productId,
      href: link
    })
      .append(
        $('<div/>',{class:'tetragon-12'})
          .append(
            $('<div/>',{class: 'tetragon__wrapper'})
              .append(
                $('<div/>',{class: 'tetragon__content'})
                  .append(
                    $('<img/>',{
                      class: 'product__thumb d-block h-100 w-100',
                      src: src,
                      alt: name,
                      error: $(this).addClass('invalid-image-src')}),
                  )
              )
          )
      );
  }


  /**
   * Отрисовать компонент
   */
  function render() {
    recommendedProducts = common.randomizeArray(recommendedProducts);
    $body = $('<div/>', {class: 'row product-review__recommended-products mt-5 border rounded'})
      .append(
        $('<div/>',{class:'col-12'})
          .append(
            $('<h2/>',{text:caption})
          )
      );
    for (var i = 0; i < 4; i++) {
      $body.append(
        $('<div/>', {class: 'col-3 d-none d-sm-block p-1'})
          .append(
            image(recommendedProducts[i].thumb,'',recommendedProducts[i].link)
          )
      )
    }
    return $body;
  }


  return render();
}
/**
 * Компонент для отображения комментариев к заказу
 * @params {object} params
 * @param  {object} params.container  - контейнер для размещения элемента
 * @param  {[]}     params.sizeList   - список размеров
 * @author skipperTeam
 * @constructor
 */
function ComponentSize(params){
  var container = params.container,
    sizeList    = params.sizeList,
    $body       = '',
    counter     = 1;

  /**
   * Создать элемент выбора размера продукта
   * @param {string} thumb - ссылка на картинку
   * @param {string} name  - наименование элемента
   * @returns {*|jQuery|HTMLElement}
   */
  function createSizeItem(thumb,name){
    return $('<option/>',{
      'data-img-src': thumb,
      text: name,
      'data-img-label': name,
      value: counter ++
    })
  }


  /**
   * Отрисовать компонент
   */
  function render(){
    $body = $('<div>',{class: 'product-review__sizes-container'})
      .append(
        $('<span/>',{text:"Выберите размер"}),
        $('<hr/>'),
        $('<select/>',{
          class: "image-picker show-labels show-html",
          'data-limit' : 1
        })
      );

    sizeList.forEach(function(size,i){
      $body.find('select').append( createSizeItem(size.image,size.name) )
    });

    $body.appendTo(container);
    $body.find('select').imagepicker({show_label: true});
  }

  /**
   * Возвратить название выбраного элемента
   */
  this.getData = function(){
    return $body
      .find(".image_picker_selector")
      .find('.selected')
      .find('p')
      .text()
  };

  /**
   * Выделить элемент
   * @param {number} index
   */
  this.setData = function(index){
    //TODO set item
  };

  /**
   * Функция конструктор
   */
  (function(){
    render();
  })()
}
/**
 * Выбор вкуса
 * Если указан массив вкусов то будет создан селект с возможность выбора вкуса, при этм сразу
 * будет сформирован RangeSlider для указания количества единиц товара данного
 * вкуса. Если указан единтственный элемен, то селект выбора вкусов формироваться не будет
 * @params params
 * @param {object}  params.container
 * @param {number}  params.productId - ИД продукта
 * @param {[]}      params.tasteList - массив доступных вкусов
 * @param {string}  params.mode      - режим отображения (один вкус|множество вкусов)
 * @params {object} params.sliderOpt - все параметры для инициализации компонента "Диапазон значений"
 * Свойства params.sliderOpt:
 * @param  {object} params.sliderOpt.rangeSliderContainer
 * @param  {*}      params.sliderOpt.index
 * @param  {string} params.sliderOpt.caption
 * @param  {number} params.sliderOpt.productsInRation
 * @param  {number} params.sliderOpt.min
 * @param  {number} params.sliderOpt.max
 * @param  {number} params.sliderOpt.step
 * @param  {number} params.sliderOpt.weight
 * @param  {number} params.sliderOpt.breakpoints
 * @constructor
 */
function ComponentTaste(params){
  var container = params.container,
    productId   = params.productId,
    tasteList   = params.tasteList,
    mode        = params.mode,
    sliderOpt   = params.sliderOpt,
    $body,
    $component  = '';

  function createTasteItem(value,name,isSelected){
    if(!isSelected) isSelected = false;
    return $('<option/>',{
      value: value,
      text: name,
      selected: isSelected
    })
  }

  /**
   * Отрисовать компонент
   * Если в настройках параметр "tasteList" содержит массив значений, значит отобразить селект вкусов,
   * при выборе определённого вкуса создается RangeSlider
   */
  function render(){
    $body = $('<div/>',{class: 'product-review__taste-container'})
      .append(
        $('<span/>',{text: (tasteList.length > 1 ? "Укажите вкус" : "Укажите количество")}),
        $('<hr>'),
        $('<select/>',{
          id:"taste-select_"+productId,
          class: "card__taste-select multipleSelect",
          multiple: true,
          name: 'taste'
        }),
        $('<div/>',{
          class: 'taste-select__range',
          id: 'taste-select__range-'+productId
        })
      );
    tasteList.forEach(function(taste,i){
      $body.find('select').append( createTasteItem(taste.val,taste.name, i === 0 ))
    });

    $body.appendTo(container);
    sliderOpt.rangeSliderContainer = $body.find('#taste-select__range-'+productId);

    if( isMultipleTastes() )
      initTastes();
    else {
      $('#taste-select_'+productId).hide();
      new RangeSlider(sliderOpt)
    }
  }


  /**
   * Возвратить вычисленный вес торта
   * вес одного куска/штуки задаётся параметром "weight" в настройках
   * @param {RangeSlider} item
   * @return {number}
   */
  function getCalculatedCakeWeight(item){
    return +$(item).find('.range__count').val();
  }


  /**
   * Возвратить вычисленное количество порций
   * соотношение порций к количеству задаётся параметром "ration" в настойках
   * @param {RangeSlider} item
   * @return {number}
   */
  function getCalculatedRationCount(item){
    return +$(item).find('.range__ration-count').val()
  }


  /**
   * Возвратить значение слайдера
   * шаг слайдера задается параметром "step" однако (лучше истользовать 1 так как с дробными значениями возникают ошибки)
   * минимальное значение параметром "min", максимальное - "max" в настройках
   * @param {RangeSlider} item
   * @return {number}
   */
  function getRangeValue(item){
    return +$(item).find('.range__value').val()
  }


  /**
   * Возвратить данные по всем указанным вкусам
   * @return {[]}
   */
  this.getData = function(){
    var tastes = [];
    $body.find('.range').each(function(index,range){
      var $item = $(range).find('.range__caption');
      var taste = $item.attr('data-taste-name') === $item.val() ?
        $item.val() :
        $item.attr('data-taste-name') + ' (' + $item.val() + ')';
      taste = taste ? taste : 'единственный';
      tastes.push(
        {
          taste       : taste,
          weight      : getCalculatedCakeWeight(range),
          value       : getRangeValue(range),
          rationCount : getCalculatedRationCount(range),
        }
      );
    });
    return tastes;
  };

  function initTastes() {
    $component = $('#taste-select_'+productId);
    $component.fastselect({
      placeholder: "Выберите иначе мы выберем сами :)",
      controlsClass: 'taste-select_'+productId+'__fstControls',
      onItemSelect: function () {
        //TODO: проверка на то что элемент уже выбран (или оставит это как фичу?)
        var tasteBind = getSelectedTaste();
        addListenerForRemoveTaste(tasteBind);
        new RangeSlider( updSliderOpt(getTasteIdentifier(tasteBind),getTasteName(tasteBind)) )
      },
    });
    //var tasteContainer = getContainer();
    var selectedTaste = getSelectedTaste();//$(tasteContainer).find('.fstChoiceItem');
    addListenerForRemoveTaste(selectedTaste);
    new RangeSlider( updSliderOpt(getTasteIdentifier(selectedTaste),getTasteName(selectedTaste)) );
  }


  function updSliderOpt(_index,_caption) {
    sliderOpt.index = _index;
    sliderOpt.caption = _caption;
    return sliderOpt
  }

  function addListenerForRemoveTaste(taste) {
    $(taste).on('click', 'button.fstChoiceRemove', function () {
      $('#' + $(taste).attr('data-value')).remove();
    });
  }

  /**
   * Проверка
   * @return {*[]|boolean}
   */
  function isMultipleTastes() {
    return tasteList && tasteList.length > 1
  }

  /**
   * Возвратить указатель на кнопку удаления вкуса
   * !необходимо для удаления компонента "Диапазон значений" (RangeSlider) созданного при выборе этого вкуса
   * @return {jQuery}
   */
  function getSelectedTaste(){
    return $('.taste-select_'+productId+'__fstControls>div:last').get(0);
  }

  /**
   * Возвратить идентификатор вкуса
   * @param selectedTaste
   * @return {*|jQuery}
   */
  function getTasteIdentifier(selectedTaste){
    return $(selectedTaste).attr('data-value');
  }


  /**
   * Возвратить название вкуса
   * @param selectedTaste
   * @return {*|jQuery}
   */
  function getTasteName(selectedTaste){
    return $(selectedTaste).attr('data-text');
  }

  /**
   * Возвратить контейнер
   * @return {jQuery}
   */
  function getContainer(){
    var tasteContainer = $component.get(0);
    return $(tasteContainer).closest('.fstElement').get(0);
  }

  (function(){
    render();
  })()
}


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJidW5kbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqINCa0LDRgtC10LPQvtGA0LjRjyDRgtC+0LLQsNGA0L7QslxyXG4gKiBAcGFyYW0ge3t9fSBwYXJhbXNcclxuICogQHBhcmFtIHtudW1iZXJ9IHBhcmFtcy5jYXRlZ29yeUlkIC0gSUQg0LrQsNGC0LXQs9C+0YDQuNC4INGC0L7QstCw0YDQvtCyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2F0ZWdvcnlOYW1lIC0g0J3QsNC30LLQsNC90LjQtSDQutCw0YLQtdCz0L7RgNC40Lgg0YLQvtCy0LDRgNC+0LIg0YLQsNC6INC20LUg0LjRgdC/0L7Qu9GM0LfRg9C10YLRgdGPINCyINC60LDRh9C10YHRgtCy0LUg0LjQvNGPINGC0LXQs9CwXHJcbiAqIEBwYXJhbSB7bnVsbHxbXX0gcGFyYW1zLnByb2R1Y3RzIC0g0KHQv9C40YHQvtC6INGC0L7QstCw0YDQvtCyXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMuY2F0ZWdvcnlDb250YWluZXIgLSDQmtC+0L3RgtC10LnQvdC10YAg0YHQv9C40YHQutCwINC60LDRgtC10LPQvtGA0LjQuVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcGFyYW1zLmdyaWRTaXplIC0g0KDQsNC30LzQtdGAINGB0LXRgtC60Lgg0YLQvtCy0LDRgNC+0LJcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtcy5jYXRlZ29yeVJlZiAtINCh0YHRi9C70LrQsCDQvdCwINGB0YLRgNCw0L3QuNGG0YMg0LrQsNGC0LXQs9C+0YDQuNC5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXMuY2F0ZWdvcnlHYWxsZXJ5UmVmIC0g0KHRgdGL0LvQutCwINC90LAg0YHRgtGA0LDQvdC40YbRgyDQs9Cw0LvQu9C10YDQtdC4XHJcbiAqIEBwYXJhbSB7W119IHBhcmFtcy5nYWxsZXJ5IC0g0J7QsdGJ0LDRjyDQs9Cw0LvQtdGA0LXRj1xyXG4gKiBAcGFyYW0ge1tdfSBwYXJhbXMuZ2VuZXJhbFRhc3RlcyAtINCh0L/QuNGB0L7QuiDQvtCx0YnQuNGFINC00LvRjyDQstGB0LXRhSDRgtC+0LLQsNGA0L7QsiDQsiDQutCw0YLQtdCz0L7RgNC40Lgg0LLQutGD0YHQvtCyICjQtNC70Y8gc2VsZWN0J9CwKVxyXG4gKiBAcGFyYW0ge1tdfSBwYXJhbXMuZ2VuZXJhbERlc2lnbnMgLSDQodC/0LjRgdC+0Log0L7QsdGJ0LjRhSDQtNC70Y8g0LLRgdC10YUg0YLQvtCy0LDRgNC+0LIg0LLQsNGA0LjQsNC90YLQvtCyINGD0LrRgNCw0YjQtdC90LjQuVxyXG4gKiBAcGFyYW0geyp9IHBhcmFtcy5nZW5lcmFsSW5mbyAtINCe0LHRidCw0Y8g0LjQvdGE0L7RgNC80LDRhtC40Y9cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBDYXRlZ29yeShwYXJhbXMpe1xyXG4gIHZhciBpZCAgICAgICAgICA9IHBhcmFtcy5jYXRlZ29yeUlkIHx8IDAsXHJcbiAgICBuYW1lICAgICAgICAgID0gcGFyYW1zLmNhdGVnb3J5TmFtZSB8fCBcItC90LUg0L7Qv9GA0LXQtNC10LvQtdC90L5cIiwgLy/QndCw0LfQstCw0L3QuNC1INC60LDRgtC10LPQvtGA0LjQuCDQvtC90L4g0LbQtSDQuCDQvdCw0LfQstCw0L3QuNC1INGE0LjQu9GM0YLRgNCwXHJcbiAgICBwcm9kdWN0c1JhbmdlID0gcGFyYW1zLnByb2R1Y3RzIHx8IG51bGwsICAgICAgICAgICAgICAgIC8v0KHQv9C40YHQvtC6INGC0L7QstCw0YDQvtCyINCyINC00LDQvdC90L7QuSDQutCw0YLQtdCz0L7RgNC40LhcclxuICAgIGNvbnRhaW5lciAgICAgPSBwYXJhbXMuY2F0ZWdvcnlDb250YWluZXIsICAgICAgICAgICAgICAgLy/QoNC+0LTQuNGC0LXQu9GM0YHQutC50Log0LrQvtC90YLQtdC50L3QtdGAXHJcbiAgICBncmlkU2l6ZSAgICAgID0gcGFyYW1zLmdyaWRTaXplIHx8IHVuZGVmaW5lZCwgICAgICAgICAgIC8v0KDQsNC30LzQtdGAINGB0LXRgtC60Lgg0YLQvtCy0LDRgNC+0LJcclxuICAgIGdhbGxlcnlQYXRoICAgPSBwYXJhbXMuZ2FsbGVyeVBhdGgsICAgICAgICAgICAgICAgICAgICAgLy/QodGB0YvQu9C60LAg0L3QsCDQs9Cw0LvQu9C10YDQtdGOXHJcbiAgICBzZXR0aW5nRmlsZSAgID0gcGFyYW1zLnNldHRpbmdGaWxlLCAgICAgICAgICAgICAgICAgICAgIC8v0JTQsNC90L3Ri9C1INC00LvRjyDQvdCw0YHRgtGA0L7QudC60Lgg0LrQsNGA0YLRiyDQv9GA0L7QtNGD0LrRgtCwXHJcbiAgICB1bmlxVGFncyAgICAgID0gbmV3IFRhZ3MoKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8v0KHQv9C40YHQvtC6INGD0L3QuNC60LDQu9GM0L3Ri9GFINGC0LXQs9C+0LJcclxuICAgIHByb2R1Y3RzICAgICAgPSBbXSxcclxuICAgIG5hdmJhckNvbnN0cnVjdG9yLGNoaWxkQ29udGFpbmVyLGJvZHksbmF2YmFyLFxyXG4gICAgaGlkZGVuICAgICAgICA9IGZhbHNlO1xyXG4gICAgc2VsZiA9IHRoaXM7XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQodC+0LfQtNCw0YLRjCDQutC+0L3RgtC10LnQvdC10YAg0LTQu9GPINC60LDRgtC10LPQvtGA0LjQuFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKCFjb250YWluZXIpe1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJDYXRlZ29yeTo6cGFyZW50Q29udGFpbmVyIGlzIG5vdCBkZWZpbmVkXCIpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNpemUgPSAgZ3JpZFNpemUgPyAnLScgKyBncmlkU2l6ZSA6ICctNic7XHJcblxyXG4gICAgaWYocHJvZHVjdHNSYW5nZS5sZW5ndGggPD0gMSkge1xyXG4gICAgICBib2R5ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAgICAgY2xhc3M6ICdjb2wtc20nK3NpemUrJyBwLTAgY2F0ZWdvcnlfX2NvbnRlbnQgc2luZ2xlLWl0ZW0nXHJcbiAgICAgIH0pLmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcbiAgICAgIGNoaWxkQ29udGFpbmVyID0gJChib2R5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNoaWxkQ29udGFpbmVyID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAgICAgaWQ6ICdjYXRlZ29yeV9fJytpZCxcclxuICAgICAgICBjbGFzczogJ3JvdyBjYXRlZ29yeV9fY29udGVudCcsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgYm9keSA9ICQoJzxkaXYvPicseyBjbGFzczonY29udGFpbmVyLWZsdWlkIHZubF9fY2F0ZWdvcnknfSlcclxuICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6J3JvdyBjYXRlZ29yeV9fdGFnJ30pXHJcbiAgICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgJCgnPGgyLz4nKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgICAgICAgJCgnPGkvPicse2NsYXNzOidmYWIgZmEtc2xhY2staGFzaCd9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAkKCc8c3Ryb25nLz4nLHt0ZXh0OiBuYW1lfSlcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICBjaGlsZENvbnRhaW5lclxyXG4gICAgICAgICk7XHJcbiAgICAgIGJvZHkuYXBwZW5kVG8oY29udGFpbmVyKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuXHJcbiAgdGhpcy5oYXNUYWcgPSBmdW5jdGlvbiAodGFnTmFtZSkge1xyXG4gICAgcmV0dXJuIHRhZ05hbWUgPT09IG5hbWVcclxuICB9O1xyXG5cclxuICB0aGlzLnJlbW92ZUxhenlMb2FkID0gZnVuY3Rpb24oKXtcclxuICAgIHByb2R1Y3RzLmZvckVhY2goZnVuY3Rpb24ocHJvZHVjdCxpKXtcclxuICAgICAgcHJvZHVjdC5yZW1vdmVMYXp5TG9hZCgpO1xyXG4gICAgfSlcclxuICB9O1xyXG5cclxuICB0aGlzLmlzSGlkZGVuID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBoaWRkZW47XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICog0JTQvtCx0LDQstC40YLRjCDQvNCw0YHRgdC40LIg0YLQvtCy0LDRgNC+0LJcclxuICAgKiBAcGFyYW0gbGlzdFxyXG4gICAqL1xyXG4gIHRoaXMuYWRkUmFuZ2UgPSBmdW5jdGlvbihsaXN0KXtcclxuICAgIGlmKHR5cGVvZiBsaXN0ID09PSBcInN0cmluZ1wiKVxyXG4gICAgICBsaXN0ID0gSlNPTi5wYXJzZShsaXN0KTtcclxuXHJcbiAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24oc3JjLGkpe1xyXG4gICAgICB1bmlxVGFncy5leHBsb3JlKHNyYy50YWdMaXN0KTtcclxuICAgICAgcHJvZHVjdHMucHVzaChcclxuICAgICAgICBuZXcgUHJvZHVjdCh7XHJcbiAgICAgICAgICAgIHByb2R1Y3RDb250YWluZXI6IGNoaWxkQ29udGFpbmVyLFxyXG4gICAgICAgICAgICBncmlkU2l6ZTogbGlzdC5sZW5ndGggPCBncmlkU2l6ZSA/IG51bGwgOiBncmlkU2l6ZSxcclxuICAgICAgICAgICAgaWQ6IHNyYy5pZCxcclxuICAgICAgICAgICAgaHJlZjogc3JjLmhyZWYsXHJcbiAgICAgICAgICAgIG5hbWU6IHNyYy5uYW1lLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogc3JjLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICB0aHVtYjogc3JjLnRodW1iLFxyXG4gICAgICAgICAgICB0YWdMaXN0OiBzcmMudGFnTGlzdCxcclxuICAgICAgICAgICAgb3ZlcnZpZXdJbWFnZXM6IHNyYy5vdmVydmlldyA/IHNyYy5vdmVydmlldyA6IFtdLFxyXG4gICAgICAgICAgICBzZXR0aW5nRmlsZTogc2V0dGluZ0ZpbGVcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG5cclxuICAgIH0pO1xyXG4gICAgLy9jb25zb2xlLmxvZyggdW5pcVRhZ3MuZ2V0VGFnTGlzdCgpICk7XHJcbiAgICBuYXZiYXIgPSBuZXcgTmF2YmFyQmxvY2soe1xyXG4gICAgICBjb250YWluZXI6ICQoJy5uYXZiYXJfX3NlY29uZGFyeScpLFxyXG4gICAgICBzb3VyY2U6IHVuaXFUYWdzLmdldFRhZ0xpc3QoKSxcclxuICAgICAgaXRlbUxpc3Q6IHByb2R1Y3RzXHJcbiAgICB9KVxyXG4gIH07XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQodC60YDRi9GC0Ywg0LHQu9C+0LpcclxuICAgKi9cclxuICB0aGlzLmhpZGUgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYoIWJvZHkpcmV0dXJuO1xyXG4gICAgYm9keS5hZGRDbGFzcyhcInNvcnRfX2hpZGVcIik7XHJcbiAgICBoaWRkZW4gPSB0cnVlO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqINCe0YLQvtCx0YDQsNC30LjRgtGMINCx0LvQvtC6XHJcbiAgICovXHJcbiAgdGhpcy5zaG93ID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKCFib2R5KXJldHVybjtcclxuICAgIGJvZHkucmVtb3ZlQ2xhc3MoJ3NvcnRfX2hpZGUnKVxyXG4gICAgICAuYWRkQ2xhc3MoXCJzb3J0X19zaG93XCIpO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgICBib2R5LnJlbW92ZUNsYXNzKFwic29ydF9fc2hvd1wiKVxyXG4gICAgfSw1MDApO1xyXG4gICAgaGlkZGVuID0gZmFsc2U7XHJcbiAgfTtcclxuXHJcbiAgKGZ1bmN0aW9uKCl7XHJcbiAgICBzZWxmLnJlbmRlcigpO1xyXG4gICAgc2VsZi5hZGRSYW5nZShwcm9kdWN0c1JhbmdlKTtcclxuICB9KSgpXHJcbn1cclxuXG47KGZ1bmN0aW9uICgpe1xyXG4gIC8v0KPQutCw0LfQsNGC0Ywg0YbQstC10YLQsCDQv9GA0L7QtdC60YLQsFxyXG4gIHRoaXMucHJpbWFyeUNvbG9yID0gJyM3OTRBNUUnO1xyXG4gIHRoaXMuc2Vjb25kYXJ5Q29sb3IgPSAnIzk0OWZhNSc7XHJcbiAgdGhpcy5kYW5nZXJDb2xvciA9ICcjODM0MTQxJztcclxuXHJcbiAgLy8g0KPQtNCw0LvQtdC90LjQtSDRjdC70LXQvNC10L3RgtCwINC40Lcg0LzQsNGB0YHQuNCy0LAuXHJcbiAgLy8gU3RyaW5nIHZhbHVlOiDQt9C90LDRh9C10L3QuNC1LCDQutC+0YLQvtGA0L7QtSDQvdC10L7QsdGF0L7QtNC40LzQviDQvdCw0LnRgtC4INC4INGD0LTQsNC70LjRgtGMLlxyXG4gIC8vIHJldHVybjog0LzQsNGB0YHQuNCyINCx0LXQtyDRg9C00LDQu9C10L3QvdC+0LPQviDRjdC70LXQvNC10L3RgtCwOyBmYWxzZSDQsiDQv9GA0L7RgtC40LLQvdC+0Lwg0YHQu9GD0YfQsNC1LlxyXG4gIEFycmF5LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgdmFyIGlkeCA9IHRoaXMuaW5kZXhPZih2YWx1ZSk7XHJcbiAgICBpZiAoaWR4ICE9PSAtMSkge1xyXG4gICAgICAvLyDQktGC0L7RgNC+0Lkg0L/QsNGA0LDQvNC10YLRgCAtINGH0LjRgdC70L4g0Y3Qu9C10LzQtdC90YLQvtCyLCDQutC+0YLQvtGA0YvQtSDQvdC10L7QsdGF0L7QtNC40LzQviDRg9C00LDQu9C40YLRjFxyXG4gICAgICByZXR1cm4gdGhpcy5zcGxpY2UoaWR4LCAxKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9O1xyXG5cclxuICB0aGlzLmdldFVSTFBhcmFtcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHFzID0gZG9jdW1lbnQubG9jYXRpb24uc2VhcmNoO1xyXG4gICAgcXMgPSBxcy5zcGxpdCgnKycpLmpvaW4oJyAnKTtcclxuXHJcbiAgICB2YXIgcGFyYW1zID0ge30sXHJcbiAgICAgIHRva2VucyxcclxuICAgICAgcmUgPSAvWz8mXT8oW149XSspPShbXiZdKikvZztcclxuXHJcbiAgICB3aGlsZSAodG9rZW5zID0gcmUuZXhlYyhxcykpIHtcclxuICAgICAgcGFyYW1zW2RlY29kZVVSSUNvbXBvbmVudCh0b2tlbnNbMV0pXSA9IGRlY29kZVVSSUNvbXBvbmVudCh0b2tlbnNbMl0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwYXJhbXM7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICog0J7Qn9GA0LXQtNC10LvQuNGC0Ywg0L3QtdC+0LHRhdC+0LTQuNC80L7RgdGC0Ywg0YHQvtGA0YLQuNGA0L7QstC60LggVVJMINC/0LDRgNCw0LzQtdGC0YAgc29ydEJ5VGFnXHJcbiAgICogQHBhcmFtIHBhcmFtc1xyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgdGhpcy5pc1NvcnRBY3Rpb25SZXF1aXJlZCA9IGZ1bmN0aW9uKHBhcmFtcyl7XHJcbiAgICByZXR1cm4gKCdzb3J0QnlUYWcnIGluIHBhcmFtcylcclxuICB9O1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0J7Qv9GA0LXQtNC10LvQuNGC0Ywg0L3QtdC+0LHRhdC+0LTQuNC80L7RgdGC0Ywg0LLRi9Cx0L7RgNCwINC60L7QvdC60YDQtdGC0L3QvtCz0L4g0Y3Qu9C10LzQtdC90YLQsCDQs9Cw0LvQtdGA0LXQuCBVUkwg0L/QsNGA0LDQvNC10YLRgCBnb3RvXHJcbiAgICogQHBhcmFtIHBhcmFtc1xyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgdGhpcy5pc1NlbGVjdFRhcmdldEltYWdlUmVxdWlyZWQgPSBmdW5jdGlvbihwYXJhbXMpe1xyXG4gICAgcmV0dXJuICggJ2dvdG8nIGluIHBhcmFtcyApXHJcbiAgfTtcclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCd0LDQudGC0Lgg0LjQt9C+0LHRgNCw0LbQtdC90LjQtSDQtdCz0L4g0LjQvNC10L3QuFxyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gaW1hZ2VOYW1lIC0g0L3QsNC40LzQtdC90L7QstCw0L3QuNC1INC40LfQvtCx0YDQsNC20LXQvdC40Y9cclxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgdGhpcy5maW5kR2FsbGVyeUl0ZW1CeUltYWdlTmFtZSA9IGZ1bmN0aW9uKGltYWdlTmFtZSl7XHJcbiAgICB2YXIgcmVzdWx0ID0gJyc7XHJcbiAgICAkKCdpbWcnKS5lYWNoKGZ1bmN0aW9uKGksaW1nKXtcclxuICAgICAgaWYoIGRpc3Rpbmd1aXNoSW1hZ2VOYW1lRnJvbUl0ZW0oaW1nKSA9PT0gaW1hZ2VOYW1lIClcclxuICAgICAgICByZXN1bHQgID0kKGltZykuY2xvc2VzdCgnLnN0b2NrX19wcm9kdWN0JylcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9O1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JLRi9C00LXQu9C40YLRjCDQuNC80Y8g0LjQt9C+0LHRgNCw0LbQtdC90LjRjyDQuNC3INC/0L7Qu9C90L7Qs9C+INC/0YPRgtC4INC6INGE0LDQudC70YNcclxuICAgKiBAcGFyYW0gIHtHYWxsZXJ5SXRlbX0gaXRlbSAtINC60L7QvNC/0L7QvdC10L3RgiDQuNC30L7QsdGA0LDQttC10L3QuNGPXHJcbiAgICogQHJldHVybiB7Kn1cclxuICAgKi9cclxuICBmdW5jdGlvbiBkaXN0aW5ndWlzaEltYWdlTmFtZUZyb21JdGVtKGl0ZW0pe1xyXG4gICAgdmFyIGEgPSAkKGl0ZW0pLmF0dHIoJ2RhdGEtc3JjJykuc3BsaXQoJy8nKTtcclxuICAgIHJldHVybiBhW2EubGVuZ3RoLTFdLnNwbGl0KCcuJylbMF07XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0KHQvtGA0YLQuNGA0L7QstC60LAg0L/QviDRgtC10LPRg1xyXG4gICAqIEBwYXJhbSB0YWdOYW1lXHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgKi9cclxuICB0aGlzLnNvcnRCeVRhZyA9IGZ1bmN0aW9uKHRhZ05hbWUpe1xyXG4gICAgaWYoIXRhZ05hbWUpIHJldHVybiBmYWxzZTtcclxuICAgIHZhciB0YWdzID0gJCgnLm5hdi10YWdzX19pdGVtJyk7XHJcbiAgICBjb25zb2xlLmxvZyh0YWdzKTtcclxuICAgIHRhZ3MuZWFjaChmdW5jdGlvbihpLHRhZyl7XHJcbiAgICAgIGlmKCQodGFnKS5hdHRyKCdkYXRhLXRhcmdldCcpLnRvVXBwZXJDYXNlKCkgPT09IHRhZ05hbWUudG9VcHBlckNhc2UoKSApXHJcbiAgICAgICAgJCh0YWcpLmNsaWNrKCk7XHJcbiAgICB9KVxyXG4gIH07XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQn9GA0L7QstC10YDQuNGC0Ywg0YPQutCw0LfQsNC9INC70Lgg0LTQuNC30LDQudC9INC40LfQtNC10LvQuNGPXHJcbiAgICovXHJcbiAgdGhpcy5pc1Byb2R1Y3REZXNpZ25TZXQgPSBmdW5jdGlvbihwYXJhbXMpe1xyXG4gICAgcmV0dXJuICggXCJwcm9kdWN0RGVzaWduXCIgaW4gcGFyYW1zIClcclxuICB9O1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0KHQvtGA0YLQuNGA0L7QstC60LAg0L/QviDRgtC10LPRg1xyXG4gICAqIEBwYXJhbSBsaW5rXHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgKi9cclxuICB0aGlzLnRyYW5zaXRpb25UbyA9IGZ1bmN0aW9uKGxpbmspe1xyXG4gICAgaWYoIWxpbmspIHJldHVybiBmYWxzZTtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgdmFyIGNhdHMgPSAkKCcuY2F0ZWdvcnlfX2NvbnRlbnQnKTtcclxuICAgICAgY29uc29sZS5sb2coY2F0cyk7XHJcbiAgICAgIGNhdHMuZWFjaChmdW5jdGlvbihpLGNhdCl7XHJcbiAgICAgICAgaWYoJChjYXQpLmZpbmQoJ2gyJykudGV4dCgpLnRvVXBwZXJDYXNlKCkgPT09IGxpbmsudG9VcHBlckNhc2UoKSApIHtcclxuICAgICAgICAgICQoY2F0KS5maW5kKCcuc3RvY2tfX3Byb2R1Y3QnKS5jbGljaygpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSw1MDApO1xyXG4gIH07XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQn9GA0L7QstC10YDQuNGC0Ywg0YPQutCw0LfQsNC9INC70Lgg0L/RgNGP0LzQvtC5INC/0LXRgNC10YXQvtC0INC6XHJcbiAgICogQHBhcmFtIHBhcmFtc1xyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgdGhpcy5pc0RpcmVjdFRyYW5zaXRpb25TZXQgPSBmdW5jdGlvbihwYXJhbXMpe1xyXG4gICAgcmV0dXJuICggXCJkaXJlY3RUcmFuc2l0aW9uVG9cIiBpbiBwYXJhbXMgKVxyXG4gIH07XHJcblxyXG5cclxuXHJcblxyXG5cclxuICB0aGlzLm9wZW5HdWlkZU1vZGFsID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciAkYm9keSA9ICQoJzxkaXYvPicse2lkOid2bmxfbW9kYWxfX2d1aWRlJ30pXHJcbiAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgJCgnPGRpdi8+Jyx7XHJcbiAgICAgICAgICBjbGFzczogJ2NvbnRhaW5lci1mbHVpZCBweS01JyxcclxuICAgICAgICAgIHRleHQ6J9Cc0Ysg0YXQvtGC0LjQvCDQvNCw0LrRgdC40LzQsNC70YzQvdC+INC/0L7Qu9C90L4g0L7RgdGD0YnQtdGB0YLQstC40YLRjCDQstCw0YjRgyDQvNC10YfRgtGDLCDQv9C+0Y3RgtC+0LzRgyDQv9GA0LXQtNC70LDQs9Cw0LXQvCDQstCw0Lwg0LLRi9Cx0YDQsNGC0Ywg0L7QtNC90YMg0LjQtyDQv9GA0LXQtNGB0YLQsNCy0LvQtdC90L3Ri9GFINC90LDRh9C40L3QvtC6J1xyXG4gICAgICAgIH0pXHJcbiAgICAgIClcclxuICAgICAgLmFwcGVuZFRvKCdib2R5Jyk7XHJcblxyXG4gICAgJGJvZHkuaXppTW9kYWwoe1xyXG4gICAgICBoZWFkZXJDb2xvcjogY29tbW9uLnByaW1hcnlDb2xvcixcclxuICAgICAgdGl0bGU6IFwi0KjQsNCzIDFcIixcclxuICAgICAgc3VidGl0bGU6IFwi0JLRi9Cx0L7RgCDQstC60YPRgdCwXCIsXHJcbiAgICAgIGF1dG9PcGVuOiB0cnVlLFxyXG4gICAgICBjbG9zZUJ1dHRvbjogdHJ1ZVxyXG4gICAgfSlcclxuICB9O1xyXG5cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCf0LXRgNC10YLRgNGP0YHRgtC4INC80LDRgdGB0LjQsiDQsiDRgNCw0L3QtNC+0LzQvdC+0Lwg0L/QvtGA0Y/QtNC60LVcclxuICAgKiBAcGFyYW0ge1tdfSBhcnIgLSDQvNCw0YHRgdC40LJcclxuICAgKiBAcmV0dXJuIHtib29sZWFufFtdfSAtINC80LDRgdGB0LjQsiDRgSDRjdC70LXQvNC10L3RgtCw0LzQuCDQsiDRgNCw0L3QtNC+0LzQvdC+0Lwg0L/QvtGA0Y/QtNC60LVcclxuICAgKi9cclxuICB0aGlzLnJhbmRvbWl6ZUFycmF5ID0gZnVuY3Rpb24oYXJyKXtcclxuICAgIGlmKCFhcnIpIHJldHVybiBmYWxzZTtcclxuICAgIHJldHVybiBhcnIuc29ydChmdW5jdGlvbigpe3JldHVybiBNYXRoLnJhbmRvbSgpIC0gMC41O30pO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiB3aW5kb3cuY29tbW9uID0gdGhpcztcclxufSkoKTtcclxuXG47ZnVuY3Rpb24gR2FsbGVyeShwYXJhbXMpIHtcclxuICB2YXIgY29udGFpbmVyICAgICAgPSBwYXJhbXMuZ2FsbGVyeUNvbnRhaW5lcixcclxuICAgIGdyaWRTaXplICAgICAgICAgPSA0LFxyXG4gICAgc2VsZiAgICAgICAgICAgICA9IHRoaXMsXHJcbiAgICB1bmlxVGFncyAgICAgICAgID0gbmV3IFRhZ3MoKSxcclxuICAgIHByb2R1Y3RMaW5rICAgICAgPSBwYXJhbXMucHJvZHVjdExpbmsgfHwgXCJzaG93Y2FzZV9fc3R1ZmZpbmcuaHRtbFwiLFxyXG4gICAgcHJvZHVjdExpbmtUaXRsZSA9IHBhcmFtcy5wcm9kdWN0TGlua1RpdGxlIHx8IFwi0JIg0L3QsNGH0LjQvdC60LhcIixcclxuICAgIHNyYyAgICAgICAgICAgICAgPSBwYXJhbXMuc3JjLFxyXG4gICAgaW1hZ2VBcnJheSAgICAgICA9IFtdLFxyXG4gICAgbmF2YmFyLFxyXG4gICAgYm9keSxcclxuICAgIGl0ZW1zICAgICAgICAgICAgPSBbXTtcclxuXHJcbiAgZnVuY3Rpb24gY29sbGVjdFNvdXJjZURhdGEoc3JjKXtcclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgIHNyYy5mb3JFYWNoKGZ1bmN0aW9uKGNhdGVnb3J5KXtcclxuICAgICAgdW5pcVRhZ3MuZXhwbG9yZShjYXRlZ29yeS50YWdMaXN0KTtcclxuICAgICAgZm9yKHZhciBpID0gMTsgaSA8IChjYXRlZ29yeS5sZW5ndGggKyAxKTsgaSsrKXtcclxuICAgICAgICByZXN1bHQucHVzaCh7XHJcbiAgICAgICAgICBpbmRleCAgOiBpLFxyXG4gICAgICAgICAgaW1nU3JjIDogY2F0ZWdvcnkuZm9sZGVyICsgJy8nKyBjYXRlZ29yeS5wcmVmaXggKyBpICsgJy5qcGcnLFxyXG4gICAgICAgICAgaHJlZiAgIDogKCdkaXJlY3RUcmFuc2l0aW9uVG8nIGluIGNhdGVnb3J5ID8gY2F0ZWdvcnkuZGlyZWN0VHJhbnNpdGlvblRvIDogbnVsbCksXHJcbiAgICAgICAgICBuYW1lICAgOiBjYXRlZ29yeS50YWcsXHJcbiAgICAgICAgICB0YWdzICAgOiBjYXRlZ29yeS50YWdMaXN0XHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgdmFyIGNvbGxlY3Rpb24gPSBjb21tb24ucmFuZG9taXplQXJyYXkoIGNvbGxlY3RTb3VyY2VEYXRhKHNyYykgKTtcclxuXHJcbiAgICBjb2xsZWN0aW9uLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICBpdGVtcy5wdXNoKFxyXG4gICAgICAgICAgbmV3IEdhbGxlcnlJdGVtKHtcclxuICAgICAgICAgICAgY29udGFpbmVyICAgICAgICAgOiBjb250YWluZXIsXHJcbiAgICAgICAgICAgIHRodW1iICAgICAgICAgICAgIDogaXRlbS5pbWdTcmMsXHJcbiAgICAgICAgICAgIGdyaWRTaXplICAgICAgICAgIDogZ3JpZFNpemUsXHJcbiAgICAgICAgICAgIHByb2R1Y3RMaW5rICAgICAgIDogcHJvZHVjdExpbmssXHJcbiAgICAgICAgICAgIGRpcmVjdFRyYW5zaXRpb25UbzogaXRlbS5ocmVmLFxyXG4gICAgICAgICAgICBwcm9kdWN0TGlua1RpdGxlICA6IHByb2R1Y3RMaW5rVGl0bGUsXHJcbiAgICAgICAgICAgIGlkICAgICAgICAgICAgICAgIDogaXRlbS5pbmRleCxcclxuICAgICAgICAgICAgbmFtZSAgICAgICAgICAgICAgOiBpdGVtLm5hbWUsXHJcbiAgICAgICAgICAgIHRhZ0xpc3QgICAgICAgICAgIDogaXRlbS50YWdzXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBuYXZiYXIgPSBuZXcgTmF2YmFyQmxvY2soe1xyXG4gICAgICBjb250YWluZXI6ICQoJy5uYXZiYXJfX3ByaW1hcnknKSxcclxuICAgICAgc291cmNlOiB1bmlxVGFncy5nZXRUYWdMaXN0KCksXHJcbiAgICAgIGl0ZW1MaXN0OiBpdGVtc1xyXG4gICAgfSlcclxuICB9O1xyXG5cclxuICAoZnVuY3Rpb24oKXtcclxuICAgIHJlbmRlcigpO1xyXG4gIH0pKClcclxufTtcbi8qKlxyXG4gKiDQmtCw0YDRgtC40L3QutCwINCyINCz0LDQu9C70LXRgNC10LVcclxuICogQHBhcmFtIHt7fX0gcGFyYW1zXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gR2FsbGVyeUl0ZW0ocGFyYW1zKXtcclxuICAgIHZhciBpZFByb2R1Y3QgICAgICAgICAgPSBwYXJhbXMuaWQsXHJcbiAgICAgICAgdGh1bWIgICAgICAgICAgICAgID0gcGFyYW1zLnRodW1iIHx8IFwiLi4uXCIsXHJcbiAgICAgICAgcHJvZHVjdExpbmsgICAgICAgID0gcGFyYW1zLnByb2R1Y3RMaW5rIHx8XCJzaG93Y2FzZV9fc3R1ZmZpbmcuaHRtbFwiLFxyXG4gICAgICAgIHByb2R1Y3RMaW5rVGl0bGUgICA9IHBhcmFtcy5wcm9kdWN0TGlua1RpdGxlIHx8IFwi0JIg0L3QsNGH0LjQvdC60LhcIixcclxuICAgICAgICBkaXJlY3RUcmFuc2l0aW9uVG8gPSBwYXJhbXMuZGlyZWN0VHJhbnNpdGlvblRvIHx8IG51bGwsXHJcbiAgICAgICAgY29udGFpbmVyICAgICAgICAgID0gcGFyYW1zLmNvbnRhaW5lcixcclxuICAgICAgICB0YWdMaXN0ICAgICAgICAgICAgPSBwYXJhbXMudGFnTGlzdCB8fCBbXSxcclxuICAgICAgICBncmlkU2l6ZSAgICAgICAgICAgPSBwYXJhbXMuZ3JpZFNpemUgfHwgJycsXHJcbiAgICAgICAgbmFtZSAgICAgICAgICAgICAgID0gcGFyYW1zLm5hbWUgfHwgXCJMb3JlbSBpcHN1bVwiLFxyXG4gICAgICAgIGhpZGRlbiAgICAgICAgICAgICA9IGZhbHNlLFxyXG4gICAgICAgIGJvZHksXHJcbiAgICAgICAgc2VsZiAgICAgICAgICAgICAgID0gdGhpcztcclxuXHJcbiAgICAvKipcclxuICAgICAqINCe0YLRgNC40YHQvtCy0LDRgtGMINC/0YDQvtC00YPQutGCINC10YHQu9C4INGD0LrQsNC30LDQvSDRgNC+0LTQuNGC0LXQu9GM0YHQutC40Lkg0Y3Qu9C10LzQtdC90YJcclxuICAgICAqL1xyXG4gICAgdGhpcy5yZW5kZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIGlmKCFjb250YWluZXIpe1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJHYWxsZXJ5SXRlbTo6Y29udGFpbmVyIGlzIG5vdCBkZWZpbmVkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgdmFyIGR0dCA9IGRpcmVjdFRyYW5zaXRpb25UbyA/ICcmZGlyZWN0VHJhbnNpdGlvblRvPScrZGlyZWN0VHJhbnNpdGlvblRvIDogJyc7XHJcbiAgICAgIHZhciBmb290ZXIgPSAkKCc8ZGl2Lz4nLHtjbGFzczonbW9kYWwtZm9vdGVyX19jb250ZW50J30pXHJcbiAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICQoJzxkaXYvPicse1xyXG4gICAgICAgICAgICAvL3RleHQ6J9CS0Ysg0LzQvtC20LXRgtC1INGB0LrQvtC/0LjRgNC+0LLQsNGC0Ywg0YHRgdGL0LvQutGDINC90LAg0LjQt9C+0LHRgNCw0LbQtdC90LjQtSDQuCDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0L/RgNC4INC30LDQutCw0LfQtSDRgtC+0YDRgtCwOiAnICsgZG9jdW1lbnQuZG9tYWluICsgJy8nICsgdGh1bWIucmVwbGFjZSgnLi4vLi4vJywgJycpXHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICAgICQoJzxkaXYvPicse2NsYXNzOidkLWZsZXgganVzdGlmeS1jb250ZW50LWNlbnRlciB3LTEwMCd9KVxyXG4gICAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICQoJzxhLz4nLHtcclxuICAgICAgICAgICAgICAgIGNsYXNzOididG4gYnRuLW91dGxpbmUtcHJpbWFyeSBweS0yIHB4LTUgbXQtMicsXHJcbiAgICAgICAgICAgICAgICBocmVmIDpwcm9kdWN0TGluayArIFwiP3Byb2R1Y3REZXNpZ249XCIgKyAgdGh1bWIucmVwbGFjZSgnLi4vLi4vJywgJycpK2R0dCxcclxuICAgICAgICAgICAgICAgIHRleHQgOnByb2R1Y3RMaW5rVGl0bGV9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKTtcclxuICAgICAgICBmb290ZXIgPSBmb290ZXIud3JhcCgpLmh0bWwoKTtcclxuXHJcbiAgICAgIGdyaWRTaXplID0gZ3JpZFNpemUgPyAnLXNtLScrZ3JpZFNpemUgOiAnLTEyJztcclxuXHJcbiAgICAgICAgYm9keSA9ICQoJzxhLz4nLCB7XHJcbiAgICAgICAgICBjbGFzczogXCJ0ZXRyYWdvblwiICsgZ3JpZFNpemUgKyBcIiBzdG9ja19fcHJvZHVjdCBwLTFcIixcclxuICAgICAgICAgIGhyZWY6IHRodW1iLFxyXG4gICAgICAgICAgLy8nZGF0YS10aXRsZSc6IG5hbWUsXHJcbiAgICAgICAgICAnZGF0YS1mb290ZXInOiBmb290ZXIsXHJcbiAgICAgICAgICAnZGF0YS1nYWxsZXJ5JzogXCJnYWxsZXJ5X19pdGVtXCIsXHJcbiAgICAgICAgICAnZGF0YS10b2dnbGUnOiBcImxpZ2h0Ym94XCIsXHJcbiAgICAgICAgICAnZGF0YS13aWR0aCc6IFwiODAwXCIsXHJcbiAgICAgICAgICAnZGF0YS1oZWlnaHQnOiBcIjgwMFwiLFxyXG4gICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgJCh0aGlzKS5la2tvTGlnaHRib3goe1xyXG4gICAgICAgICAgICAgICAgLy9hbHdheXNTaG93Q2xvc2U6IHRydWVcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICQoJzxkaXYvPicse2NsYXNzOid0ZXRyYWdvbl9fd3JhcHBlcid9KVxyXG4gICAgICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczondGV0cmFnb25fX2NvbnRlbnQnfSlcclxuICAgICAgICAgICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgICAgICAgICAkKCc8aW1nLz4nLHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOidwcm9kdWN0X190aHVtYiBkLWJsb2NrIHctMTAwIGgtMTAwJyxcclxuICAgICAgICAgICAgICAgICAgICAgIHNyYzogJ2ltZy9wcmUtbG9hZGVyLmdpZicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1zcmMnOiB0aHVtYixcclxuICAgICAgICAgICAgICAgICAgICAgIGFsdDogbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2ludmFsaWQtaW1hZ2Utc3JjJylcclxuICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICByZWFkeTogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5sYXp5TG9hZFhUKClcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICBib2R5LmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0KPQsdGA0LDRgtGMINC70LXQvdC40LLRg9GOINC30LDQs9GA0YPQt9C60YMg0LjQt9C+0LHRgNCw0LbQtdC90LjQuVxyXG4gICAqL1xyXG4gIHRoaXMucmVtb3ZlTGF6eUxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRhID0gJChib2R5KS5maW5kKCdpbWcnKTtcclxuICAgICAgICB2YXIgYiA9ICRhLmF0dHIoJ2RhdGEtc3JjJyk7XHJcbiAgICAgICAgJGEuYXR0cignc3JjJyxiKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQodC60YDRi9GC0Ywg0LHQu9C+0LpcclxuICAgICAqL1xyXG4gICAgdGhpcy5oaWRlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBpZighYm9keSlyZXR1cm47XHJcbiAgICAgICAgaGlkZGVuID0gdHJ1ZTtcclxuICAgICAgICBib2R5LmFkZENsYXNzKFwic29ydF9faGlkZSBhbmltYXRlZCBmbGlwT3V0WVwiKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0J7RgtC+0LHRgNCw0LfQuNGC0Ywg0LHQu9C+0LpcclxuICAgICAqL1xyXG4gICAgdGhpcy5zaG93ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBpZighYm9keSlyZXR1cm47XHJcbiAgICAgICAgaGlkZGVuID0gZmFsc2U7XHJcbiAgICAgICAgYm9keS5yZW1vdmVDbGFzcygnc29ydF9faGlkZSBhbmltYXRlZCBmbGlwT3V0WScpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcyhcInNvcnRfX3Nob3cgYW5pbWF0ZWQgZmxpcEluWVwiKTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGJvZHkucmVtb3ZlQ2xhc3MoXCJzb3J0X19zaG93IGFuaW1hdGVkIGZsaXBJbllcIilcclxuICAgICAgICB9LDUwMCk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqINCf0YDQvtCy0LXRgNC40YLRjCDRgdGD0YnQtdGB0YLQstC+0LLQsNC90LjRjyDRgtC10LPQsCDQsiDRgdC/0LjRgdC60LUg0YLQtdCz0L7QslxyXG4gICAgICogQHBhcmFtIHRhZ05hbWVcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICB0aGlzLmhhc1RhZyA9IGZ1bmN0aW9uICh0YWdOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRhZ0xpc3QuaW5kZXhPZih0YWdOYW1lKSAhPT0gLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqINCf0YDQvtCy0LXRgNC40YLRjCDRgdC60YDRi9GCINC70Lgg0LrQvtC80L/QvtC90LXQvdGCXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICB0aGlzLmlzSGlkZGVuID0gZnVuY3Rpb24oKXtcclxuICAgICAgcmV0dXJuIGhpZGRlbjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIHRoaXMuZ2V0SW1hZ2UgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiB0aHVtYlxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdGhpcy5nZXROYW1lID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog0JLQvtC30LLRgNCw0YLQuNGC0Ywg0YPQutCw0LfQsNGC0LXQu9GMINC90LAg0Y3Qu9C10LzQtdC90YIg0LIg0LTQtdGA0LXQstC1INC+0LHRitC10LrRgtC+0LJcclxuICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICovXHJcbiAgICB0aGlzLmdldEJvZHkgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiBib2R5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDQktC+0LfQstGA0LDRgtC40YLRjCDRgdC/0LjRgdC+0Log0YLQtdCz0L7QslxyXG4gICAgICogQHJldHVybnMgeyp8QXJyYXl9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuZ2V0VGFnTGlzdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIHRhZ0xpc3RcclxuICAgIH07XHJcblxyXG5cclxuICAgIChmdW5jdGlvbigpe1xyXG4gICAgICAgIHNlbGYucmVuZGVyKClcclxuICAgIH0pKClcclxuXHJcbn1cclxuXHJcblxuZnVuY3Rpb24gT3JkZXJDb25maXJtYXRpb25Nb2RhbChwYXJhbXMpe1xyXG4gIHZhciB0aXRsZSAgICAgPSBwYXJhbXMudGl0bGUgfHwgJ9Ch0L/QsNGB0LjQsdC+INC30LAg0LLQsNGIINC30LDQutCw0LcnLFxyXG4gICAgc3VidGl0bGUgID0gcGFyYW1zLnN1YnRpdGxlIHx8ICfQvNGLINGB0LrQvtGA0L4g0YEg0LLQsNC80Lgg0YHQstGP0LbQtdC80YHRjycsXHJcbiAgICBjb250ZW50ICAgPSBwYXJhbXMuY29udGVudCxcclxuICAgIHR5cGUgICAgICA9IHBhcmFtcy50eXBlIHx8ICdzdWNjZXNzJyxcclxuICAgIFNVQ0NFU1MgICA9IGNvbW1vbi5zZWNvbmRhcnlDb2xvcixcclxuICAgIERBTkdFUiAgICA9IGNvbW1vbi5kYW5nZXJDb2xvcixcclxuICAgICRib2R5O1xyXG5cclxuICBmdW5jdGlvbiByZW5kZXIoKXtcclxuICAgICRib2R5ID0gJCgnPGRpdi8+Jyx7aWQ6ICdvcmRlci1jb25maXJtYXRpb24nfSlcclxuICAgICAgLmFwcGVuZChcclxuICAgICAgICAkKCc8ZGl2Lz4nLHtcclxuICAgICAgICAgIGNsYXNzOiAnY29udGFpbmVyLWZsdWlkIHB5LTUnLFxyXG4gICAgICAgICAgaHRtbDogIGNvbnRlbnRcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgJGJvZHkuYXBwZW5kVG8oJ2JvZHknKTtcclxuICAgICRib2R5Lml6aU1vZGFsKHtcclxuICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICBzdWJ0aXRsZTogc3VidGl0bGUsXHJcbiAgICAgIHppbmRleDogMjAwMDAsXHJcbiAgICAgIGhlYWRlckNvbG9yOiAodHlwZSA9PT0gJ3N1Y2Nlc3MnID8gU1VDQ0VTUyA6IERBTkdFUiksXHJcbiAgICAgIGF1dG9PcGVuOnRydWUsXHJcbiAgICAgIG9uQ2xvc2VkOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICQodGhpcykuaXppTW9kYWwoJ2Rlc3Ryb3knKTtcclxuICAgICAgICAkYm9keS5yZW1vdmUoKTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIChmdW5jdGlvbigpe1xyXG4gICAgcmVuZGVyKCk7XHJcbiAgfSkoKVxyXG59XG4vKipcclxuICog0J7QtNCw0LvRjNC90L7QtSDQvtC60L3QviDQtNC70Y8g0LLQstC+0LTQsCDQtNCw0L3QvdGL0YUg0L4g0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C1XHJcbiAqINC+0YHQvdC+0LLQsNC90L4g0L3QsCDQutC+0LzQv9C+0L3QvdC10L3RgtC1IGl6aU1vZGFsXHJcbiAqIEBwYXJhbSBwYXJhbXNcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBQZXJzb25DYXJkTW9kYWwocGFyYW1zKXtcclxuICB2YXIgY29udGFpbmVyID0gcGFyYW1zLmNvbnRhaW5lcixcclxuICAgICRib2R5ICAgICAgID0gJycsXHJcbiAgICBzZWxmICAgICAgICA9IHRoaXM7XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQodC+0LfQtNCw0L3QuNC1INC60L7QvNC/0L7QvdC10L3RgtCwINCy0LLQvtC00LAg0LTQsNC90L3Ri9GFINC90LAg0YTQvtGA0LzQtVxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgY2xhc3NOYW1lICAgLSDQutC70LDRgdGBINC60L7QvNC/0L7QvdC10L3RgtCwICjQvtCx0YvRh9C90L4g0Y3RgtC+INGI0LjRgNC40L3QsCDQutC+0LvQvtC90LrQuClcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gIGNhcHRpb24gICAgIC0g0L3QsNC30LLQsNC90LjQtSDQstCy0L7QtNC40LzQvtCz0L4g0L/QsNGA0LDQvNC10YLRgNCwXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9ICB0eXBlICAgICAgICAtINGC0LjQvyDRjdC70LXQvNC10L3RgtCwIGlucHV0XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9ICBuYW1lICAgICAgICAtINC40LzRjyDRjdC70LXQvNC10L3RgtCwIGlucHV0XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9ICBwbGFjZWhvbGRlciAtINGC0LXQutGB0YIg0L/Qu9C10LnRgdGF0L7QtNC10YBcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzUmVxICAgICAgIC0g0L/RgNC40LfQvdCw0Log0L7QsdGP0LfQsNGC0LXQu9GM0L3QvtGB0YLQuCDQt9Cw0L/QvtC70L3QtdC90LjRjyDQv9C+0LvRjyAo0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4gZmFsc2UpXHJcbiAgICogQHJldHVybiB7alF1ZXJ5fVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZEZpZWxkKHtjbGFzc05hbWU9JycsY2FwdGlvbj0n0J/QvtC70LUg0LLQstC+0LTQsCcsdHlwZT0ndGV4dCcsbmFtZT0nJyxwbGFjZWhvbGRlcj0n0JLQstC10LTQuNGC0LUg0YLQtdC60YHRgicsaXNSZXE9ZmFsc2V9KXtcclxuICAgIHJldHVybiAkKCc8ZGl2Lz4nLHtjbGFzczogY2xhc3NOYW1lfSlcclxuICAgICAgLmFwcGVuZChcclxuICAgICAgICAkKCc8bGFiZWwvPicse2NsYXNzOiAnbXQtMyB0ZXh0LWRhcmsnLHRleHQ6IGNhcHRpb259KSxcclxuICAgICAgICAkKCc8aW5wdXQvPicse1xyXG4gICAgICAgICAgY2xhc3M6J2Zvcm0tY29udHJvbCB0ZXh0LWRhcmsnLFxyXG4gICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgIHBsYWNlaG9sZGVyOiBwbGFjZWhvbGRlcixcclxuICAgICAgICAgIHJlYWR5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgJCh0aGlzKS51bmJpbmQoJ2ZvY3VzJykudW5iaW5kKCdmb2N1c2luJyk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgIHJlcXVpcmVkOiBpc1JlcVxyXG4gICAgICAgIH0pXHJcbiAgICAgIClcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQodC+0LfQtNCw0L3QuNC1INC80L7QtNCw0LvRjNC90L7Qs9C+INC+0LrQvdCwINCy0LLQvtC00LAg0LTQsNC90L3Ri9GFINC+INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtSDQuCDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjRjyDQtdCz0L4g0LrQsNC6INC60L7QvNC/0L7QvdC10L3RgtCwIGl6aU1vZGFsXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgJChjb250YWluZXIpLmZpbmQoJy5pemlNb2RhbC1jb250ZW50JykucmVtb3ZlKCk7XHJcbiAgICAkYm9keSA9ICQoJzxkaXYvPicse2lkOidtb2RhbCcsIGNsYXNzOidza2l0X19pemlNb2RhbCBwZXJzb24tbW9kYWwnfSkuYXBwZW5kKFxyXG4gICAgICAkKCc8Zm9ybS8+Jyx7Y2xhc3M6ICdvcmRlck92ZXInfSkuYXBwZW5kKFxyXG4gICAgICAgICQoJzxkaXYvPicse2NsYXNzOidjb250YWluZXItZmx1aWQnfSkuYXBwZW5kKFxyXG4gICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6J3Jvdyd9KS5hcHBlbmQoXHJcbiAgICAgICAgICAgIGFkZEZpZWxkKHtcclxuICAgICAgICAgICAgICBjbGFzc05hbWU6J2NvbC1zbS0xMicsXHJcbiAgICAgICAgICAgICAgY2FwdGlvbjogJ9Ck0LDQvNC40LvQuNGPIDonLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICBuYW1lOiAnbGFzdE5hbWUnLFxyXG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAn0KTQsNC80LjQu9C40Y8nLFxyXG4gICAgICAgICAgICAgIGlzUmVxOiBmYWxzZVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgYWRkRmllbGQoe1xyXG4gICAgICAgICAgICAgIGNsYXNzTmFtZTonY29sLXNtLTEyJyxcclxuICAgICAgICAgICAgICBjYXB0aW9uOiAn0JjQvNGPKiA6JyxcclxuICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgbmFtZTogJ2ZpcnN0TmFtZScsXHJcbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICfQmNC80Y8nLFxyXG4gICAgICAgICAgICAgIGlzUmVxOiB0cnVlXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6ICdyb3cgbXQtMyd9KS5hcHBlbmQoXHJcbiAgICAgICAgICAgIGFkZEZpZWxkKHtcclxuICAgICAgICAgICAgICBjbGFzc05hbWU6J2NvbC1zbS0xMicsXHJcbiAgICAgICAgICAgICAgY2FwdGlvbjogJ9Ci0LXQu9C10YTQvtC9INC00LvRjyDRgdCy0Y/Qt9C4KiA6JyxcclxuICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgbmFtZTogJ3Bob25lJyxcclxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJyszNzUo0KXQpSnQpdCl0KUt0KXQpS3QpdClJyxcclxuICAgICAgICAgICAgICBpc1JlcTogdHJ1ZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAgICQoJzxkaXYvPicse2NsYXNzOidyb3cgbXQtMyd9KS5hcHBlbmQoXHJcbiAgICAgICAgICAgIGFkZEZpZWxkKHtcclxuICAgICAgICAgICAgICBjbGFzc05hbWU6J2NvbC1zbS0xMicsXHJcbiAgICAgICAgICAgICAgY2FwdGlvbjogJ9CQ0LTRgNC10YEg0Y3Qu9C10LrRgtGA0L7QvdC90L7QuSDQv9C+0YfRgtGLKiA6JyxcclxuICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgbmFtZTogJ2VtYWlsJyxcclxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0V4YW1wbGVAbWFpbC5jb20nLFxyXG4gICAgICAgICAgICAgIGlzUmVxOiB0cnVlXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6J3JvdyBteS0zJ30pLmFwcGVuZChcclxuICAgICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6ICdjb2wtMTIgZC1mbGV4IGp1c3RpZnktY29udGVudC1jZW50ZXInfSkuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICQoJzxpbnB1dCB0eXBlPVwic3VibWl0XCIgaWQ9XCJlbmQtb2Ytb3JkZXJpbmdcIiBjbGFzcz1cImJ0biBidG4tb3V0bGluZS1wcmltYXJ5IHAtNFwiIHZhbHVlPVwi0J7RgtC/0YDQsNCy0LjRgtGMXCIvPicpLFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgKS8vZW5kIGNvbnRhaW5lci1mbHVpZFxyXG4gICAgICApLy9lbmQgZm9ybVxyXG4gICAgKVxyXG4gICAgICAuYXBwZW5kVG8oY29udGFpbmVyKTtcclxuICAgICRib2R5Lm9uKCdzdWJtaXQnLCcub3JkZXJPdmVyJyxmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJGJvZHkuaXppTW9kYWwoJ2Nsb3NlJyk7XHJcbiAgICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ3BlcnNvbk1vZGFsQ2xvc2VkJywgc2VsZi5nZXREYXRhKCkpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgJGJvZHkuaXppTW9kYWwoe1xyXG4gICAgICAvL2F1dG9PcGVuOiB0cnVlLFxyXG4gICAgICBhdXRvZm9jdXM6IGZhbHNlLFxyXG4gICAgICBmdWxsc2NyZWVuOiBmYWxzZSxcclxuICAgICAgaGVhZGVyQ29sb3I6ICcjNzk0YTVlJyxcclxuICAgICAgdGl0bGU6ICfQqNCw0LMgMicsXHJcbiAgICAgIHN1YnRpdGxlOiAn0KDQsNGB0YHQutCw0LbQuNGC0LUg0L4g0YHQtdCx0LUnLFxyXG4gICAgICBpY29uOiAnLmljb24gLmljb25fX2xvZ28nLFxyXG4gICAgICB6aW5kZXg6IDIwMDAsXHJcbiAgICAgIC8qb25DbG9zZWQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJCh0aGlzKS5pemlNb2RhbCgnZGVzdHJveScpO1xyXG4gICAgICAgICRib2R5LnJlbW92ZSgpO1xyXG4gICAgICB9Ki9cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICog0JLQvtC30LLRgNCw0YLQuNGC0Ywg0L7QsdGK0LXQutGCINCyINC60L7RgtC+0YDQvtC8INGB0L7QsdGA0LDQvdGLINCy0YHQtSDQtNCw0L3QvdGL0LUg0L4g0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C1XHJcbiAgICogQHJldHVybiB7e2xhc3ROYW1lLCBmaXJzdE5hbWUsIHBob25lLCBlbWFpbH19XHJcbiAgICovXHJcbiAgdGhpcy5nZXREYXRhID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGxhc3ROYW1lOiAkYm9keS5maW5kKCdbbmFtZT1cImxhc3ROYW1lXCJdJykudmFsKCksXHJcbiAgICAgIGZpcnN0TmFtZTogJGJvZHkuZmluZCgnW25hbWU9XCJmaXJzdE5hbWVcIl0nKS52YWwoKSxcclxuICAgICAgcGhvbmU6ICRib2R5LmZpbmQoJ1tuYW1lPVwicGhvbmVcIl0nKS52YWwoKSxcclxuICAgICAgZW1haWw6ICRib2R5LmZpbmQoJ1tuYW1lPVwiZW1haWxcIl0nKS52YWwoKVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQo9GB0YLQsNC90L7QstC40YLRjCDQtNCw0L3QvdGL0LUg0YTQvtGA0LzRi1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsYXN0TmFtZSAtINGE0LDQvNC40LvQuNGPXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpcnN0TmFtZSAtINC40LzRj1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwaG9uZSAtINC90L7QvNC10YAg0YLQtdC70LXRhNC+0L3QsFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBlbWFpbCAtINCw0LTRgNC10YEg0Y3Qu9C10LrRgtGA0L7QvdC90L7QuSDQv9C+0YfRgtGLXHJcbiAgICovXHJcbiAgdGhpcy5zZXREYXRhID0gZnVuY3Rpb24oe2xhc3ROYW1lPScnLGZpcnN0TmFtZT0nJyxwaG9uZT0nJyxlbWFpbD0nJ30pe1xyXG4gICAgJGJvZHkuZmluZCgnW25hbWU9XCJsYXN0TmFtZVwiXScpLnZhbChsYXN0TmFtZSk7XHJcbiAgICAkYm9keS5maW5kKCdbbmFtZT1cImZpcnN0TmFtZVwiXScpLnZhbChmaXJzdE5hbWUpO1xyXG4gICAgJGJvZHkuZmluZCgnW25hbWU9XCJwaG9uZVwiXScpLnZhbChwaG9uZSk7XHJcbiAgICAkYm9keS5maW5kKCdbbmFtZT1cImVtYWlsXCJdJykudmFsKGVtYWlsKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JLRi9C30LLQsNGC0YwgaXppTW9kYWxcclxuICAgKi9cclxuICB0aGlzLnNob3cgPSBmdW5jdGlvbigpe1xyXG4gICAgJGJvZHkuaXppTW9kYWwoJ29wZW4nKVxyXG4gIH07XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQndC10LzQtdC00LvQtdC90L3QvtC1INC/0L7RgdGC0YDQvtC10L3QuNC1INC80L7QtNCw0LvRjNC90L7Qs9C+INC+0LrQvdCwINC/0YDQuCDRgdC+0LfQtNCw0L3QuNC4INGN0LrQt9C10LzQv9C70Y/RgNCwINC60LvQsNGB0YHQsFxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqL1xyXG4gIChmdW5jdGlvbigpe1xyXG4gICAgcmVuZGVyKCk7XHJcbiAgfSkoKVxyXG59XG4vKipcclxuICog0J/RgNC+0LTRg9C60YJcclxuICogQHBhcmFtcyAge3t9fSAgICAgcGFyYW1zXHJcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IHBhcmFtcy5pZCAgICAgICAgICAgICAgLSDQmNCUINC/0YDQvtC00YPQutGC0LBcclxuICogQHBhcmFtICAge3N0cmluZ30gcGFyYW1zLnRodW1iICAgICAgICAgICAtINGB0YHRi9C70LrQsCDQvdCwINCz0LvQsNCy0L3QvtC1INC40LfQvtCx0YDQsNC20LXQvdC40LUg0L/RgNC+0LTRg9C60YLQsFxyXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBwYXJhbXMuaHJlZiAgICAgICAgICAgIC0g0YHRgdGL0LvQutCwINC90LAg0YHRgtGA0LDQvdC40YbRgyDQvtCx0LfQvtGA0LAg0YLQvtCy0LDRgNCwXHJcbiAqIEBwYXJhbSAgIHtvYmplY3R9IHBhcmFtcy5wcm9kdWN0Q29udGFpbmVyIC0g0YDQvtC00LjRgtC10LvRjNGB0LrQuNC5INC60L7QvdGC0LXQudC90LXRgFxyXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBwYXJhbXMuZ3JpZFNpemUgICAgICAgIC0g0YDQsNC30LzQtdGAINGB0LXRgtC60Lgg0YLQvtCy0LDRgNC+0LJcclxuICogQHBhcmFtICAge1tdfSAgICAgcGFyYW1zLnRhZ0xpc3QgICAgICAgICAtINGB0L/QuNGB0L7QuiDRgtC10LPQvtCyXHJcbiAqIEBwYXJhbSAgIHtzdHJpbmd9IHBhcmFtcy5uYW1lICAgICAgICAgICAgLSDQvdCw0LjQvNC10L3QvtCy0LDQvdC40LUg0L/RgNC+0LTRg9C60YLQsFxyXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBwYXJhbXMuZGVzY3JpcHRpb24gICAgIC0g0L7Qv9C40YHQsNC90LjQtSDQv9GA0L7QtNGD0LrRgtCwXHJcbiAqIEBwYXJhbSAgIHtbXX0gICAgIHBhcmFtcy5vdmVydmlld0ltYWdlcyAgLSDRgdC/0LjRgdC+0Log0LjQt9C+0LHRgNCw0LbQtdC90LjQuSDRgtC+0LLQsNGA0LBcclxuICogQHBhcmFtICAge3N0cmluZ30gcGFyYW1zLnNldHRpbmdGaWxlICAgICAtINC90LDQuNC80LXQvdC+0LLQsNC90LjQtSDRhNCw0LnQu9CwICjQvtCx0YrQtdC60YLQsCDQsiB3aW5kb3cpINC90LDRgdGC0YDQvtC10LpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBQcm9kdWN0KHBhcmFtcyl7XHJcbiAgdmFyIGlkUHJvZHVjdCAgICAgICA9IHBhcmFtcy5pZCxcclxuICAgICAgdGh1bWIgICAgICAgICAgID0gcGFyYW1zLnRodW1iIHx8IFwiLi4uXCIsXHJcbiAgICAgIGxpbmtUb0NhcmQgICAgICA9IHBhcmFtcy5ocmVmIHx8XCIjXCIsXHJcbiAgICAgIGNvbnRhaW5lciAgICAgICA9IHBhcmFtcy5wcm9kdWN0Q29udGFpbmVyLFxyXG4gICAgICBncmlkU2l6ZSAgICAgICAgPSBwYXJhbXMuZ3JpZFNpemUgfHwgbnVsbCxcclxuICAgICAgdGFnTGlzdCAgICAgICAgID0gcGFyYW1zLnRhZ0xpc3QgfHwgW10sXHJcbiAgICAgIG5hbWUgICAgICAgICAgICA9IHBhcmFtcy5uYW1lIHx8IFwiTG9yZW0gaXBzdW1cIixcclxuICAgICAgZGVzY3JpcHRpb24gICAgID0gcGFyYW1zLmRlc2NyaXB0aW9uIHx8IFwiXCIsXHJcbiAgICAgIG92ZXJ2aWV3SW1hZ2VzICA9IHBhcmFtcy5vdmVydmlld0ltYWdlcyxcclxuICAgICAgc2V0dGluZ0ZpbGUgICAgID0gcGFyYW1zLnNldHRpbmdGaWxlLFxyXG4gICAgICBoaWRkZW4gICAgICAgICAgPSBmYWxzZSxcclxuICAgICAgYm9keSxcclxuICAgICAgc2VsZiAgICAgICAgICAgID0gdGhpcyxcclxuICAgICAgb25DbGlja0ZuICAgICAgID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBuZXcgUHJvZHVjdFJldmlldyh7XHJcbiAgICAgICAgICBjb250YWluZXI6IGxpbmtUb0NhcmQsXHJcbiAgICAgICAgICBpZDogaWRQcm9kdWN0LFxyXG4gICAgICAgICAgdGh1bWI6IHRodW1iLFxyXG4gICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcclxuICAgICAgICAgIGltYWdlTGlzdDogb3ZlcnZpZXdJbWFnZXMsXHJcbiAgICAgICAgICBzZXR0aW5nRmlsZSA6c2V0dGluZ0ZpbGVcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICog0J7RgtGA0LjRgdC+0LLQsNGC0Ywg0L/RgNC+0LTRg9C60YIg0LXRgdC70Lgg0YPQutCw0LfQsNC9INGA0L7QtNC40YLQtdC70YzRgdC60LjQuSDRjdC70LXQvNC10L3RglxyXG4gICAqL1xyXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKCFjb250YWluZXIpe1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJQcm9kdWN0Ojpjb250YWluZXIgaXMgbm90IGRlZmluZWRcIik7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBncmlkU2l6ZSA9IGdyaWRTaXplID8gJy1zbS0nK2dyaWRTaXplIDogJy0xMic7XHJcblxyXG4gICAgYm9keSA9ICQoJzxkaXYvPicse1xyXG4gICAgICBjbGFzczogXCJ0ZXRyYWdvblwiK2dyaWRTaXplK1wiIHN0b2NrX19wcm9kdWN0IHAtMVwiLFxyXG4gICAgICBpZDogXCJwcm9kdWN0X19cIitpZFByb2R1Y3QsXHJcbiAgICAgIGNsaWNrOiBvbkNsaWNrRm59KS5hcHBlbmQoXHJcbiAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6ICd0ZXRyYWdvbl9fd3JhcHBlcid9KS5hcHBlbmQoXHJcbiAgICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczogJ3RldHJhZ29uX19jb250ZW50J30pLmFwcGVuZChcclxuICAgICAgICAgICAgJCgnPGltZy8+Jyx7XHJcbiAgICAgICAgICAgICAgY2xhc3M6ICdwcm9kdWN0X190aHVtYiBkLWJsb2NrIGgtMTAwIHctMTAwJyxcclxuICAgICAgICAgICAgICBzcmM6ICdpbWcvcHJlLWxvYWRlci5naWYnLFxyXG4gICAgICAgICAgICAgICdkYXRhLXNyYyc6IHRodW1iLFxyXG4gICAgICAgICAgICAgIGFsdDogbmFtZSxcclxuICAgICAgICAgICAgICBlcnJvcjogJCh0aGlzKS5hZGRDbGFzcygnaW52YWxpZC1pbWFnZS1zcmMnKX0pLFxyXG4gICAgICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczogJ3Byb2R1Y3RfX2Rlc2NyaXB0aW9uJ30pLmFwcGVuZChcclxuICAgICAgICAgICAgICAkKCc8aDIvPicse3RleHQ6IG5hbWV9KSxcclxuICAgICAgICAgICAgICAkKCc8cC8+Jyx7Y2xhc3M6ICd0ZXh0LW5vd3JhcCB0ZXh0LXRydW5jYXRlJywgdGV4dDogZGVzY3JpcHRpb259KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG4gICAgICApO1xyXG4gICAgYm9keS5hcHBlbmRUbyhjb250YWluZXIpO1xyXG4gIH07XHJcblxyXG4gIHRoaXMucmVtb3ZlTGF6eUxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJGEgPSAkKGJvZHkpLmZpbmQoJ2ltZycpO1xyXG4gICAgdmFyIGIgPSAkYS5hdHRyKCdkYXRhLXNyYycpO1xyXG4gICAgJGEuYXR0cignc3JjJyxiKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiDQodC60YDRi9GC0Ywg0LHQu9C+0LpcclxuICAgKi9cclxuICB0aGlzLmhpZGUgPSBmdW5jdGlvbigpe1xyXG4gICAgaWYoICFib2R5IClcclxuICAgICAgcmV0dXJuO1xyXG4gICAgaGlkZGVuID0gdHJ1ZTtcclxuICAgIGJvZHkuYWRkQ2xhc3MoXCJzb3J0X19oaWRlIGFuaW1hdGVkIGZsaXBPdXRZXCIpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqINCe0YLQvtCx0YDQsNC30LjRgtGMINCx0LvQvtC6XHJcbiAgICovXHJcbiAgdGhpcy5zaG93ID0gZnVuY3Rpb24oKXtcclxuICAgIGlmKCAhYm9keSApXHJcbiAgICAgIHJldHVybjtcclxuICAgIGhpZGRlbiA9IGZhbHNlO1xyXG4gICAgYm9keS5yZW1vdmVDbGFzcygnc29ydF9faGlkZSBhbmltYXRlZCBmbGlwT3V0WScpXHJcbiAgICAgIC5hZGRDbGFzcyhcInNvcnRfX3Nob3cgYW5pbWF0ZWQgZmxpcEluWVwiKTtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgYm9keS5yZW1vdmVDbGFzcyhcInNvcnRfX3Nob3cgYW5pbWF0ZWQgZmxpcEluWVwiKVxyXG4gICAgfSw1MDApO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqINCf0YDQvtCy0LXRgNC40YLRjCDRgdGD0YnQtdGB0YLQstC+0LLQsNC90LjRjyDRgtC10LPQsCDQsiDRgdC/0LjRgdC60LUg0YLQtdCz0L7QslxyXG4gICAqIEBwYXJhbSB0YWdOYW1lXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgdGhpcy5oYXNUYWcgPSBmdW5jdGlvbiAodGFnTmFtZSkge1xyXG4gICAgLy9jb25zb2xlLmxvZyh0YWdOYW1lLG5hbWUpO1xyXG4gICAgcmV0dXJuIHRhZ0xpc3QuaW5kZXhPZih0YWdOYW1lKSAhPT0gLTE7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICog0J/RgNC+0LLQtdGA0LjRgtGMINGB0LrRgNGL0YIg0LvQuCDQutC+0LzQv9C+0L3QtdC90YJcclxuICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAqL1xyXG4gIHRoaXMuaXNIaWRkZW4gPSBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIGhpZGRlbjtcclxuICB9O1xyXG5cclxuICB0aGlzLmdldEltYWdlID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiB0aHVtYlxyXG4gIH07XHJcblxyXG4gIHRoaXMuZ2V0TmFtZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9O1xyXG5cclxuICB0aGlzLmdldERlc2NyaXB0aW9uID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBkZXNjcmlwdGlvbjtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiDQktC+0LfQstGA0LDRgtC40YLRjCDRg9C60LDQt9Cw0YLQtdC70Ywg0L3QsCDRjdC70LXQvNC10L3RgiDQsiDQtNC10YDQtdCy0LUg0L7QsdGK0LXQutGC0L7QslxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIHRoaXMuZ2V0Qm9keSA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gYm9keTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiDQktC+0LfQstGA0LDRgtC40YLRjCDRgdC/0LjRgdC+0Log0YLQtdCz0L7QslxyXG4gICAqIEByZXR1cm5zIHsqfEFycmF5fVxyXG4gICAqL1xyXG4gIHRoaXMuZ2V0VGFnTGlzdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGFnTGlzdFxyXG4gIH07XHJcblxyXG4gIChmdW5jdGlvbigpe1xyXG4gICAgc2VsZi5yZW5kZXIoKTtcclxuICB9KSgpXHJcbn1cclxuXHJcblxuLyoqXHJcbiAqINCe0LHQt9C+0YAg0L/RgNC+0LTRg9C60YLQsFxyXG4gKiBAcGFyYW0gcGFyYW1zXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gUHJvZHVjdFJldmlldyhwYXJhbXMpe1xyXG4gIGxldCBjb250YWluZXIgICAgICAgICAgICAgICA9IHBhcmFtcy5jb250YWluZXIsXHJcbiAgICBpZCAgICAgICAgICAgICAgICAgICAgICAgID0gcGFyYW1zLmlkLFxyXG4gICAgbmFtZSAgICAgICAgICAgICAgICAgICAgICA9IHBhcmFtcy5uYW1lLFxyXG4gICAgZGVzY3JpcHRpb24gICAgICAgICAgICAgICA9IHBhcmFtcy5kZXNjcmlwdGlvbixcclxuICAgIHRodW1iICAgICAgICAgICAgICAgICAgICAgPSBwYXJhbXMudGh1bWIsXHJcbiAgICBpbWFnZUxpc3QgICAgICAgICAgICAgICAgID0gcGFyYW1zLmltYWdlTGlzdCB8fCBudWxsLFxyXG4gICAgc2V0dGluZ0ZpbGUgICAgICAgICAgICAgICA9IHBhcmFtcy5zZXR0aW5nRmlsZSxcclxuICAgIHNlbGYgICAgICAgICAgICAgICAgICAgICAgPSB0aGlzLFxyXG4gICAgc2hvd0dhbGxlcnlPZlRodW1ibmFpbHMgICA9IHRydWUsXHJcbiAgICB0aHVtYm5haWxzQ2FwdGlvbiAgICAgICAgID0gJycsXHJcbiAgICBub3RlICAgICAgICAgICAgICAgICAgICAgID0gJycsXHJcbiAgICBtaW5pbXVtT3JkZXIgICAgICAgICAgICAgID0gMSxcclxuICAgIGNvc3QgICAgICAgICAgICAgICAgICAgICAgPSAxLFxyXG4gICAgbWluICAgICAgICAgICAgICAgICAgICAgICA9IDEsXHJcbiAgICBtYXggICAgICAgICAgICAgICAgICAgICAgID0gNyxcclxuICAgIHN0ZXAgICAgICAgICAgICAgICAgICAgICAgPSAxLFxyXG4gICAgd2VpZ2h0ICAgICAgICAgICAgICAgICAgICA9IDAuNTAsXHJcbiAgICByYXRpb24gICAgICAgICAgICAgICAgICAgID0gMyxcclxuICAgIGJyZWFrcG9pbnRzICAgICAgICAgICAgICAgPSBbXSxcclxuICAgIG5vT3B0aW9ucyAgICAgICAgICAgICAgICAgPSBmYWxzZSxcclxuICAgIHRhc3RlTGlzdCAgICAgICAgICAgICAgICAgPSBudWxsLFxyXG4gICAgZGVjb3JDYXB0aW9uICAgICAgICAgICAgICA9IG51bGwsXHJcbiAgICBkZWNvckxpc3QgICAgICAgICAgICAgICAgID0gbnVsbCxcclxuICAgIHNpemVMaXN0ICAgICAgICAgICAgICAgICAgPSBudWxsLFxyXG4gICAgJGJvZHksXHJcbiAgICBhZFN0dWZmaW5nTGlzdCAgICAgICAgICAgID0gbnVsbCxcclxuICAgIG9yZGVyQ29tcGxldGlvbiAgICAgICAgICAgPSBudWxsO1xyXG5cclxuICBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICAkYm9keSA9ICQoJzxkaXYvPicse2NsYXNzOiAndm5sX21vZGFsX19wcm9kdWN0LXJldmlldyd9KS5hcHBlbmQoXHJcbiAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6ICdwcm9kdWN0LXJldmlldyBweS01IHB4LTMnfSkuYXBwZW5kKFxyXG4gICAgICAgICAgJCgnPGZvcm0vPicse2NsYXNzOiAncHJvZHVjdC1yZXZpZXdfX2Zvcm0nfSkuYXBwZW5kKFxyXG4gICAgICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczoncm93J30pLmFwcGVuZChcclxuICAgICAgICAgICAgICBhZGRTZWN0aW9uKCdwcm9kdWN0LXJldmlld19fZ2FsbGVyeScsIGFkZEJ1dHRvbkdyb3VwKSxcclxuICAgICAgICAgICAgICBhZGRTZWN0aW9uKCdwcm9kdWN0LXJldmlld19faW5mbycsJycpXHJcbiAgICAgICAgICAgICkvL2VuZCByb3dcclxuICAgICAgICAgICksLy9lbmQgZm9ybVxyXG4gICAgICAgICAgQ29tcG9uZW50UmVjb21tZW5kZWRQcm9kdWN0cyh7XHJcbiAgICAgICAgICAgIHByb2R1Y3RJZCAgICAgICAgICAgICAgIDogaWQsXHJcbiAgICAgICAgICAgIGNhcHRpb24gICAgICAgICAgICAgICAgIDogJ0Mg0Y3RgtC40Lwg0YLQvtCy0LDRgNC+0Lwg0YLQsNC6INC20LUg0L/QvtC60YPQv9Cw0Y7RgidcclxuICAgICAgICAgIH0pLy9lbmQgcmVjb21tZW5kZWQgcHJvZHVjdHMgYmxvY2tcclxuICAgICAgICApLy9lbmQgcHJvZHVjdC1yZXZpZXdcclxuICAgICAgKTsvL2VuZCB2bmxfbW9kYWxfX3Byb2R1Y3QtcmV2aWV3XHJcbiAgICAkYm9keS5hcHBlbmRUbygnYm9keScpO1xyXG4gICAgJGJvZHkuaXppTW9kYWwoe1xyXG4gICAgICBoZWFkZXJDb2xvcjpjb21tb24ucHJpbWFyeUNvbG9yLFxyXG4gICAgICB0aXRsZTogbmFtZSxcclxuICAgICAgc3VidGl0bGU6IChkZXNjcmlwdGlvbi5sZW5ndGggPiAxMDAgPyBkZXNjcmlwdGlvbi5zdWJzdHIoMCwxMDApICsgJy4uLicgOiBkZXNjcmlwdGlvbiksXHJcbiAgICAgIGZ1bGxzY3JlZW46IHRydWUsXHJcbiAgICAgIGF1dG9PcGVuOiB0cnVlLFxyXG4gICAgICB3aWR0aDogMTIwMCxcclxuICAgICAgb25DbG9zZWQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJCh0aGlzKS5pemlNb2RhbCgnZGVzdHJveScpO1xyXG4gICAgICAgICRib2R5LnJlbW92ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgUmV2aWV3R2FsbGVyeSh7XHJcbiAgICAgIGNvbnRhaW5lciAgICAgICAgICAgICAgIDogJGJvZHkuZmluZCgnLnByb2R1Y3QtcmV2aWV3X19nYWxsZXJ5JykuZmluZCgnLmNvbnRhaW5lci1mbHVpZCcpICxcclxuICAgICAgaWQgICAgICAgICAgICAgICAgICAgICAgOiBpZCxcclxuICAgICAgdGh1bWIgICAgICAgICAgICAgICAgICAgOiB0aHVtYixcclxuICAgICAgbmFtZSAgICAgICAgICAgICAgICAgICAgOiBuYW1lLFxyXG4gICAgICBpbWFnZUxpc3QgICAgICAgICAgICAgICA6IGltYWdlTGlzdCxcclxuICAgICAgc2hvd0dhbGxlcnlPZlRodW1ibmFpbHMgOiBzaG93R2FsbGVyeU9mVGh1bWJuYWlscyxcclxuICAgICAgdGh1bWJuYWlsc0NhcHRpb24gICAgICAgOiB0aHVtYm5haWxzQ2FwdGlvbixcclxuICAgIH0pO1xyXG4gICAgbmV3IFJldmlld0luZm8oe1xyXG4gICAgICBjb250YWluZXIgICAgICAgICAgICAgICA6ICRib2R5LmZpbmQoJy5wcm9kdWN0LXJldmlld19faW5mbycpLmZpbmQoJy5jb250YWluZXItZmx1aWQnKSAsXHJcbiAgICAgIGlkICAgICAgICAgICAgICAgICAgICAgIDogaWQsXHJcbiAgICAgIG5hbWUgICAgICAgICAgICAgICAgICAgIDogbmFtZSxcclxuICAgICAgZGVzY3JpcHRpb24gICAgICAgICAgICAgOiBkZXNjcmlwdGlvbixcclxuICAgICAgbWluaW11bU9yZGVyICAgICAgICAgICAgOiBtaW5pbXVtT3JkZXIsXHJcbiAgICAgIGNvc3QgICAgICAgICAgICAgICAgICAgIDogY29zdCxcclxuICAgICAgbWluICAgICAgICAgICAgICAgICAgICAgOiBtaW4sXHJcbiAgICAgIG1heCAgICAgICAgICAgICAgICAgICAgIDogbWF4LFxyXG4gICAgICBzdGVwICAgICAgICAgICAgICAgICAgICA6IHN0ZXAsXHJcbiAgICAgIHdlaWdodCAgICAgICAgICAgICAgICAgIDogd2VpZ2h0LFxyXG4gICAgICByYXRpb24gICAgICAgICAgICAgICAgICA6IHJhdGlvbixcclxuICAgICAgbm90ZSAgICAgICAgICAgICAgICAgICAgOiBub3RlLFxyXG4gICAgICBub09wdGlvbnMgICAgICAgICAgICAgICA6IG5vT3B0aW9ucyxcclxuICAgICAgYnJlYWtwb2ludHMgICAgICAgICAgICAgOiBicmVha3BvaW50cyxcclxuICAgICAgdGFzdGVMaXN0ICAgICAgICAgICAgICAgOiB0YXN0ZUxpc3QsXHJcbiAgICAgIGRlY29yQ2FwdGlvbiAgICAgICAgICAgIDogZGVjb3JDYXB0aW9uLFxyXG4gICAgICBkZWNvckxpc3QgICAgICAgICAgICAgICA6IGRlY29yTGlzdCxcclxuICAgICAgc2l6ZUxpc3QgICAgICAgICAgICAgICAgOiBzaXplTGlzdCxcclxuICAgICAgYWRTdHVmZmluZ0xpc3QgICAgICAgICAgOiBhZFN0dWZmaW5nTGlzdCxcclxuICAgICAgb3JkZXJDb21wbGV0aW9uICAgICAgICAgOiBvcmRlckNvbXBsZXRpb24sXHJcbiAgICAgIC8vVE9ETyDQstCw0YDQuNCw0L3RgtGLINC40YHQv9C+0LvQvdC10L3QuNGPIDog0YLQvtGA0YJ80YLRgNCw0LnRhNC70YtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJ2JvZHknKS5vZmYoJ29yZGVyQ2xvc2VkJykub24oJ29yZGVyQ2xvc2VkJyxmdW5jdGlvbihlLHBlcnNvbkRhdGEsb3JkZXJEYXRhKXtcclxuICAgICAgc2VuZE9yZGVyRGF0YShwZXJzb25EYXRhLG9yZGVyRGF0YSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQodGH0LjRgtCw0YLRjCDRhNCw0LnQuyDQvdCw0YHRgtGA0L7QtdC6INC4INC+0L/RgNC10LTQtdC70LjRgtGMINC/0LXRgNC10LzQtdC90L3Ri9C1XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcmVhZFNldHRpbmdzKCl7XHJcbiAgICBsZXQgbztcclxuICAgIGlmKCBzZXR0aW5nRmlsZSBpbiB3aW5kb3cuc2V0dGluZyApXHJcbiAgICAgIG8gPSB3aW5kb3cuc2V0dGluZ1tzZXR0aW5nRmlsZV07XHJcbiAgICAgIHNob3dHYWxsZXJ5T2ZUaHVtYm5haWxzID0gKCAnc2hvd0dhbGxlcnlPZlRodW1ibmFpbHMnIGluIG8gKSA/IG8uc2hvd0dhbGxlcnlPZlRodW1ibmFpbHMgOiB0cnVlO1xyXG4gICAgICB0aHVtYm5haWxzQ2FwdGlvbiAgICAgICA9ICggJ3RodW1ibmFpbHNDYXB0aW9uJyAgICAgICBpbiBvICkgPyBvLnRodW1ibmFpbHNDYXB0aW9uIDogJyc7XHJcbiAgICAgIG5vdGUgICAgICAgICAgICAgICAgICAgID0gKCAnbm90ZScgICAgICAgICAgICAgICAgICAgIGluIG8gKSA/IG8ubm90ZSA6ICcnO1xyXG4gICAgICBtaW5pbXVtT3JkZXIgICAgICAgICAgICA9ICggJ21pbmltdW1PcmRlcicgICAgICAgICAgICBpbiBvICkgPyBvLm1pbmltdW1PcmRlcjogJzEg0YjRgi4nO1xyXG4gICAgICBjb3N0ICAgICAgICAgICAgICAgICAgICA9ICggJ2Nvc3QnICAgICAgICAgICAgICAgICAgICBpbiBvICkgPyBvLmNvc3QgOiAxO1xyXG4gICAgICBtaW4gICAgICAgICAgICAgICAgICAgICA9ICggJ21pbicgICAgICAgICAgICAgICAgICAgICBpbiBvICkgPyBvLm1pbiA6IDE7XHJcbiAgICAgIG1heCAgICAgICAgICAgICAgICAgICAgID0gKCAnbWF4JyAgICAgICAgICAgICAgICAgICAgIGluIG8gKSA/IG8ubWF4IDogNztcclxuICAgICAgc3RlcCAgICAgICAgICAgICAgICAgICAgPSAoICdzdGVwJyAgICAgICAgICAgICAgICAgICAgaW4gbyApID8gby5zdGVwIDogMTtcclxuICAgICAgd2VpZ2h0ICAgICAgICAgICAgICAgICAgPSAoICd3ZWlnaHQnICAgICAgICAgICAgICAgICAgaW4gbyApID8gby53ZWlnaHQgOiAwLjUwO1xyXG4gICAgICByYXRpb24gICAgICAgICAgICAgICAgICA9ICggJ3JhdGlvbicgICAgICAgICAgICAgICAgICBpbiBvICkgPyBvLnJhdGlvbiA6IDM7XHJcbiAgICAgIHRhc3RlTGlzdCAgICAgICAgICAgICAgID0gKCAndGFzdGVMaXN0JyAgICAgICAgICAgICAgIGluIG8gKSA/IG8udGFzdGVMaXN0IDogbnVsbDtcclxuICAgICAgZGVjb3JDYXB0aW9uICAgICAgICAgICAgPSAoICdkZWNvckNhcHRpb24nICAgICAgICAgICAgaW4gbyApID8gby5kZWNvckNhcHRpb24gOiBudWxsO1xyXG4gICAgICBkZWNvckxpc3QgICAgICAgICAgICAgICA9ICggJ2RlY29yTGlzdCcgICAgICAgICAgICAgICBpbiBvICkgPyBvLmRlY29yTGlzdCA6IG51bGw7XHJcbiAgICAgIHNpemVMaXN0ICAgICAgICAgICAgICAgID0gKCAnc2l6ZUxpc3QnICAgICAgICAgICAgICAgIGluIG8gKSA/IG8uc2l6ZUxpc3QgOiBudWxsO1xyXG4gICAgICBhZFN0dWZmaW5nTGlzdCAgICAgICAgICA9ICggJ2FkZGl0aW9uYWxTdHVmZmluZ0xpc3QnICBpbiBvICkgPyBvLmFkZGl0aW9uYWxTdHVmZmluZ0xpc3QgOiBudWxsO1xyXG4gICAgICBicmVha3BvaW50cyAgICAgICAgICAgICA9ICggJ2JyZWFrcG9pbnRzJyAgICAgICAgICAgICBpbiBvICkgPyBvLmJyZWFrcG9pbnRzIDogW107XHJcbiAgICAgIG5vT3B0aW9ucyAgICAgICAgICAgICAgID0gKCAnbm9PcHRpb25zJyAgICAgICAgICAgICAgIGluIG8gKSA/IG8ubm9PcHRpb25zIDogZmFsc2U7XHJcbiAgICAgIG9yZGVyQ29tcGxldGlvbiAgICAgICAgID0gKCAnb3JkZXJDb21wbGV0aW9uTW9kYWwnICAgIGluIG8gKSA/IG8ub3JkZXJDb21wbGV0aW9uTW9kYWwgOiBudWxsO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCU0L7QsdCw0LLQuNGC0Ywg0YDQsNC30LTQtdC7XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgc2VjdGlvbk5hbWUgLSDQvdCw0LjQvNC10L3QvtCy0LDQvdC40LUg0YDQsNC30LTQtdC70LBcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBpbm5lckJvZHkgICAtINC60L7QvdGC0LXQvdGCXHJcbiAgICogQHJldHVybiB7KnxqUXVlcnl9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYWRkU2VjdGlvbihzZWN0aW9uTmFtZSxpbm5lckJvZHkpe1xyXG4gICAgaWYoICFpbm5lckJvZHkgfHwgdHlwZW9mIGlubmVyQm9keSAhPT0gJ2Z1bmN0aW9uJyApXHJcbiAgICAgIGlubmVyQm9keSA9IGZ1bmN0aW9uKCl7fTtcclxuXHJcbiAgICByZXR1cm4gJCgnPGRpdi8+Jyx7Y2xhc3M6J2NvbC1tZCAnICsgc2VjdGlvbk5hbWV9KS5hcHBlbmQoXHJcbiAgICAgICQoJzxkaXYvPicse2NsYXNzOidjb250YWluZXItZmx1aWQnfSksXHJcbiAgICAgIGlubmVyQm9keSgpXHJcbiAgICApXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JTQvtCx0LDQstC40YLRjCDQs9GA0YPQv9C/0YMg0LrQvdC+0L/QvtC6INGBINGC0YDQuNCz0LPQtdGA0LDQvNC4INC80L7QtNCw0LvRjNC90YvRhSDQvtC60L7QvVxyXG4gICAqIEByZXR1cm4geyp8alF1ZXJ5fVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZEJ1dHRvbkdyb3VwKCl7XHJcbiAgICByZXR1cm4gJCgnPGRpdi8+Jyx7Y2xhc3M6J2NhcmRfX2J0bi1ncm91cCd9KS5hcHBlbmQoXHJcbiAgICAgICQoJzxkaXYvPicse2NsYXNzOididG4tZ3JvdXAgdy0xMDAgcHgtMycsIHJvbGU6J2dyb3VwJywgJ2FyaWEtbGFiZWwnOidPdGhlck9wdGlvbnMnfSkuYXBwZW5kKFxyXG4gICAgICAgIGFkZE1vZGFsVHJpZ2dlcign0J7RhNC+0YDQvNC70LXQvdC40LUnLCBcIiNkZWNvcmF0ZS1tb2RhbC1vcGVuXCIsIFwiXCIpLFxyXG4gICAgICAgIGFkZE1vZGFsVHJpZ2dlcign0JLQvtC/0YDQvtGB0YsnLCBcIiNmYXEtbW9kYWwtb3BlblwiLCAnbXgtMScpLFxyXG4gICAgICAgIGFkZE1vZGFsVHJpZ2dlcign0JLQtdGBJywgXCIjZGVsaXZlcnktbW9kYWwtb3BlblwiLCBcIlwiKVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JTQvtCx0LDQstC40YLRjCDRgtGA0LjQs9Cz0LXRgCDQtNC70Y8g0L7RgtC60YDRi9GC0LjRjyDQvNC+0LTQsNC70LhcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgICAgICAtINC90LDQuNC80LXQvdC+0LLQsNC40LUg0LrQvdC+0L/QutC4XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGFsTmFtZSAgLSDQmNCUINC80L7QtNCw0LvRjNC90L7Qs9C+INCx0LvQvtC60LBcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lICAtINCU0L7Qv9C+0LvQvdC40YLQtdC70YzQvdGL0Lkg0LrQu9Cw0YHRgSDQtNC70Y8g0LrQvdC+0L/QutC4XHJcbiAgICogQHJldHVybiB7KnxqUXVlcnl8SFRNTEVsZW1lbnR9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYWRkTW9kYWxUcmlnZ2VyKHRpdGxlLG1vZGFsTmFtZSwgY2xhc3NOYW1lKXtcclxuICAgIHJldHVybiAkKCc8ZGl2Lz4nLHtcclxuICAgICAgaHJlZjogJyMnLFxyXG4gICAgICBjbGFzczogJ2J0biBidG4tb3V0bGluZS1wcmltYXJ5IHctMTAwICcgKyBjbGFzc05hbWUsXHJcbiAgICAgICdkYXRhLWl6aW1vZGFsLW9wZW4nOiBtb2RhbE5hbWUsXHJcbiAgICAgICdkYXRhLWl6aW1vZGFsLXppbmRleCc6XCIyMDAwMFwiLFxyXG4gICAgICAnZGF0YS1pemltb2RhbC1wcmV2ZW50Y2xvc2UnOlwiXCIsXHJcbiAgICAgIHRleHQ6IHRpdGxlXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCe0YLQv9GA0LDQstC40YLRjCDQtNCw0L3QvdGL0LUg0LfQsNC60LDQt9CwINC90LAg0YHQtdGA0LLQtdGAXHJcbiAgICogQHBhcmFtIHtbXX0gcGVyc29uIC0g0LTQsNC90L3Ri9C1INC/0L4g0LrQu9C40LXQvdGC0YNcclxuICAgKiBAcGFyYW0ge1tdfSBvcmRlciAgLSDQtNCw0L3QvdGL0LUg0L/QviDQt9Cw0LrQsNC30YNcclxuICAgKi9cclxuICBmdW5jdGlvbiBzZW5kT3JkZXJEYXRhKHBlcnNvbixvcmRlcil7XHJcbiAgICAkLnBvc3QoJy4vY29yZS9vcmRlckNvbnRyb2xsZXIucGhwJyxcclxuICAgICAge1xyXG4gICAgICAgIHBlcnNvbkRhdGE6SlNPTi5zdHJpbmdpZnkocGVyc29uKSxcclxuICAgICAgICBvcmRlckRhdGE6SlNPTi5zdHJpbmdpZnkob3JkZXIpXHJcbiAgICAgIH0sXHJcbiAgICAgIGZ1bmN0aW9uIChkYXRhKXtcclxuICAgICAgICBuZXcgT3JkZXJDb25maXJtYXRpb25Nb2RhbCh7XHJcbiAgICAgICAgICBjb250ZW50OiBkYXRhXHJcbiAgICAgICAgfSlcclxuICAgICAgfSlcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBAY29uc3RydWN0b3JcclxuICAgKi9cclxuICAoZnVuY3Rpb24oKXtcclxuICAgIHJlYWRTZXR0aW5ncygpO1xyXG4gICAgcmVuZGVyKCk7XHJcbiAgICAkKCdib2R5JykudHJpZ2dlcigncHJvZHVjdE9wZW4nKTtcclxuICB9KSgpXHJcbn1cclxuXG4vKipcclxuICpcclxuICogQHBhcmFtIHBhcmFtc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFJhbmdlU2xpZGVyKHBhcmFtcyl7XHJcbiAgdmFyIGNvbnRhaW5lciA9IHBhcmFtcy5yYW5nZVNsaWRlckNvbnRhaW5lcixcclxuICAgIGluZGV4ICAgICAgICAgICA9IHBhcmFtcy5pbmRleCB8fCBcIlwiLFxyXG4gICAgbmFtZSAgICAgICAgICAgID0gcGFyYW1zLm5hbWUgfHwgJ3NsaWRlcicsXHJcbiAgICBjYXB0aW9uICAgICAgICAgPSBwYXJhbXMuY2FwdGlvbiB8fCAnJyxcclxuICAgIHByb2RJblJhdGlvbiAgICA9IHBhcmFtcy5wcm9kdWN0c0luUmF0aW9uIHx8IDMsICAvL9C60L7Qu9C40YfQtdGB0YLQstC+INC10LTQuNC90LjRhiDQv9GA0L7QtNGD0LrRgtCw0LIg0L7QtNC90L7QuSDQv9C+0YDRhtC40LhcclxuICAgIG1pblJhbmdlVmFsdWUgICA9ICBwYXJhbXMubWluIHx8IDEsICAgICAgICAgICAgIC8v0LzQuNC90LjQvNCw0LvRjNC90L4g0LLQvtC30LLQvtC20L3QvtC1INC60L7Qu9C40YfQtdGB0YLQstC+INC10LTQuNC90LjRhiDQv9GA0L7QtNGD0LrRhtC40Lgg0LTQu9GPINC30LDRj9Cy0LrQuFxyXG4gICAgbWF4UmFuZ2VWYWx1ZSAgID0gcGFyYW1zLm1heCB8fCA3LCAgICAgICAgICAgICAgLy/QvNCw0LrRgdC40LzQsNC70YzQvdC+INCy0L7Qt9C80L7QttC90L7QtSDQutC+0LvQuNGH0LXRgdGC0LLQvlxyXG4gICAgcmFuZ2VTdGVwVmFsdWUgID0gcGFyYW1zLnN0ZXAgfHwgMSwgICAgICAgICAgICAvL9GI0LDQsyDRgdC70LDQudC00LXRgNCwXHJcbiAgICB3ZWlnaHQgICAgICAgICAgPSBwYXJhbXMud2VpZ2h0IDwgMSA/IHBhcmFtcy53ZWlnaHQqMTAwMCA6IHBhcmFtcy53ZWlnaHQsXHJcbiAgICB1bml0cyAgICAgICAgICAgPSBwYXJhbXMud2VpZ2h0IDwgMSA/ICfQs9GAJyA6ICfQutCzJyB8fCAnJyxcclxuICAgICRyYW5nZSwkY291bnQsJHJhdGlvbnMsYm9keSwkdmFsdWUsXHJcbiAgICBzZWxmID0gdGhpcyxcclxuICAgIGJwQ29udHJvbGxlcixcclxuICAgIGN1cnJlbnRWYWx1ZSxcclxuICAgIGJyZWFrcG9pbnRzICAgICA9IHBhcmFtcy5icmVha3BvaW50cyB8fCBudWxsO1xyXG5cclxuICBmdW5jdGlvbiBpc0JyZWFrcG9pbnRzRGVmaW5lKCl7XHJcbiAgICByZXR1cm4gYnJlYWtwb2ludHMgJiYgYnJlYWtwb2ludHMubGVuZ3RoID49IDFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqINCe0YLRgNC40YHQvtCy0LDRgtGMINC60L7QvNC/0L7QvdC10L3RglxyXG4gICAqL1xyXG4gIHRoaXMucmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgIGNvbnRhaW5lci5lbXB0eSgpO1xyXG4gICAgaWYoICFpc0JyZWFrcG9pbnRzRGVmaW5lKCkgKVxyXG4gICAgICB1bml0cyA9ICfRiNGCLic7XHJcblxyXG4gICAgdmFyIGJyZWFrcG9pbnRDb250YWluZXIgPSAoYnJlYWtwb2ludHMgJiYgYnJlYWtwb2ludHMubGVuZ3RoICE9PSAwKSA/ICc8ZGl2IGlkPVwiYnJlYWtwb2ludF9fY29udGFpbmVyXCI+PC9kaXY+JyA6ICcnO1xyXG4gICAgY2FwdGlvbiA9IGNhcHRpb24gPyAnPGlucHV0IGNsYXNzPVwicmFuZ2VfX2NhcHRpb25cIiBkYXRhLXRhc3RlLW5hbWU9XCInICtjYXB0aW9uKyAnXCIgdmFsdWU9XCInICtjYXB0aW9uKyAnXCIvPicgOiBcIlwiO1xyXG5cclxuICAgIGJvZHkgPSAkKFxyXG4gICAgICAnPGRpdiBpZD1cIicgK2luZGV4KyAnXCIgY2xhc3M9XCJyb3cgcmFuZ2VcIj4nICtcclxuICAgICAgJyA8ZGl2IGNsYXNzPVwiY29sLTEyIHJhbmdlX19jYXB0aW9uLWNvbnRhaW5lclwiPicgK1xyXG4gICAgICAgIGNhcHRpb24gK1xyXG4gICAgICAnIDwvZGl2PicgK1xyXG4gICAgICAnIDxkaXYgY2xhc3M9XCJjb2wtMiBkLWZsZXggYWxpZ24taXRlbXMtZW5kXCI+JyArXHJcbiAgICAgICcgICA8ZGl2IGNsYXNzPVwidy0xMDBcIj4nICtcclxuICAgICAgJyAgICAgPGlucHV0IHJlYWRvbmx5PVwicmVhZG9ubHlcIiBuYW1lPVwiJyArbmFtZSsgJ19fd2VpZ2h0XCIgY2xhc3M9XCJyYW5nZV9fY291bnQgdy0xMDBcIi8+JyArXHJcbiAgICAgICcgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPicgK3VuaXRzKyAnPC9kaXY+JyArXHJcbiAgICAgICcgICA8L2Rpdj4nICtcclxuICAgICAgJyA8L2Rpdj4nICtcclxuICAgICAgJyA8ZGl2IGNsYXNzPVwiY29sLTggcC0wIHBiLTRcIj4nICtcclxuICAgICAgICAgIGJyZWFrcG9pbnRDb250YWluZXIgK1xyXG4gICAgICAnICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIGNsYXNzPVwiaHRtbC1pbnB1dC1yYW5nZSAnICtpbmRleCsgJ1wiPicgK1xyXG4gICAgICAnICAgPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArbmFtZSsgJ1wiIGNsYXNzPVwicmFuZ2VfX3ZhbHVlXCIvPicgK1xyXG4gICAgICAnIDwvZGl2PicgK1xyXG4gICAgICAnIDxkaXYgY2xhc3M9XCJjb2wtMiBkLWZsZXggYWxpZ24taXRlbXMtZW5kXCI+JyArXHJcbiAgICAgICcgICA8ZGl2ICBjbGFzcz1cInctMTAwXCI+JyArXHJcbiAgICAgICcgICAgIDxpbnB1dCByZWFkb25seT1cInJlYWRvbmx5XCIgbmFtZT1cIicgK25hbWUrICdfX3JhdGlvbnNcIiBjbGFzcz1cInJhbmdlX19yYXRpb24tY291bnQgdy0xMDBcIi8+JyArXHJcbiAgICAgICcgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlciBcIiBzdHlsZT1cIndoaXRlLXNwYWNlOiBub3dyYXBcIj7Qv9C+0YDRhtC40Lk8L2Rpdj4nICtcclxuICAgICAgJyAgIDwvZGl2PicgK1xyXG4gICAgICAnIDwvZGl2PicgK1xyXG4gICAgICAnPC9kaXY+JykuaW5zZXJ0QWZ0ZXIoY29udGFpbmVyKTtcclxuXHJcbiAgICAkcmFuZ2UgPSAkKGJvZHkpLmZpbmQoJy5odG1sLWlucHV0LXJhbmdlJyk7XHJcbiAgICAkY291bnQgPSAkKGJvZHkpLmZpbmQoJy5yYW5nZV9fY291bnQnKTtcclxuICAgICR2YWx1ZSA9ICQoYm9keSkuZmluZCgnLnJhbmdlX192YWx1ZScpO1xyXG4gICAgJHJhdGlvbnMgPSAkKGJvZHkpLmZpbmQoJy5yYW5nZV9fcmF0aW9uLWNvdW50Jyk7XHJcbiAgICBpZihicmVha3BvaW50cylcclxuICAgICAgYnBDb250cm9sbGVyID0gbmV3IEJyZWFrUG9pbnRDb250YWluZXIoYnJlYWtwb2ludHMsc2VsZik7XHJcblxyXG4gICAgJHJhbmdlLmlvblJhbmdlU2xpZGVyKHtcclxuICAgICAgbWF4OiBtYXhSYW5nZVZhbHVlLFxyXG4gICAgICBtaW46IG1pblJhbmdlVmFsdWUsXHJcbiAgICAgIGZyb206IDEsXHJcbiAgICAgIGhpZGVfbWluX21heDogdHJ1ZSxcclxuICAgICAgaGlkZV9mcm9tX3RvOiB0cnVlLFxyXG4gICAgICBncmlkOiBmYWxzZSxcclxuICAgICAgdHlwZTogJ3NpbmdsZScsXHJcbiAgICAgIHN0ZXA6IHJhbmdlU3RlcFZhbHVlLFxyXG4gICAgICBmb3JjZV9lZGdlczogdHJ1ZSxcclxuICAgICAgZ3JpZF9zbmFwOiB0cnVlLFxyXG4gICAgICBoaWRlX3ZhbHVlczogdHJ1ZSxcclxuICAgICAgb25TdGFydDogaW5pdCxcclxuICAgICAgb25DaGFuZ2U6IHRyYWNrXHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiDQoNCw0LfQvNC10YHRgtC40YLRjCDRgtC+0YfQutC4INC/0YDQtdGA0YvQstCw0L3QuNGPINC90LAg0YjQutCw0LvQtSDRgdC70LDQudC00LXRgNCwXHJcbiAgICog0Lgg0YPRgdGC0LDQvdC+0LLQuNGC0Ywg0YHRgtCw0YDRgtC+0LLQvtC1INC30L3QsNGH0LXQvdC40LUg0YHQu9Cw0LnQtNC10YDQsFxyXG4gICAqIEBwYXJhbSBkYXRhXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaW5pdChkYXRhKXtcclxuICAgIGlmKGJyZWFrcG9pbnRzKVxyXG4gICAgICBicENvbnRyb2xsZXIuaW5pdCgpO1xyXG4gICAgdHJhY2soZGF0YSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqINCe0YLRgdC70LXQttC40LLQsNGC0Ywg0LfQvdCw0YfQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXHJcbiAgICogQHBhcmFtIGRhdGFcclxuICAgKi9cclxuICBmdW5jdGlvbiB0cmFjayAoZGF0YSkge1xyXG4gICAgY3VycmVudFZhbHVlID0gZGF0YS5mcm9tO1xyXG4gICAgJHZhbHVlLnZhbChkYXRhLmZyb20pO1xyXG4gICAgaWYoIGlzQnJlYWtwb2ludHNEZWZpbmUoKSApXHJcbiAgICAgICRjb3VudC52YWwoZGF0YS5mcm9tKndlaWdodCk7XHJcbiAgICBlbHNlXHJcbiAgICAgICRjb3VudC52YWwoZGF0YS5mcm9tKTtcclxuICAgICRyYXRpb25zLnZhbCggTWF0aC5jZWlsKGRhdGEuZnJvbSAvIHByb2RJblJhdGlvbikgKTtcclxuICAgIGlmKGJyZWFrcG9pbnRzKVxyXG4gICAgICBicENvbnRyb2xsZXIuc2VsZWN0QWxsYnJlYWtwb2ludHNMZXNzVGhhblZhbHVlKGRhdGEuZnJvbSlcclxuICB9XHJcblxyXG4gIHRoaXMubWluUmFuZ2VWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBtaW5SYW5nZVZhbHVlXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5tYXhSYW5nZVZhbHVlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIG1heFJhbmdlVmFsdWVcclxuICB9O1xyXG5cclxuICB0aGlzLnJhbmdlU3RlcFZhbHVlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHJhbmdlU3RlcFZhbHVlXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5nZXRCcmVha3BvaW50Q29udGFpbmVyID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiAkKGJvZHkpLmZpbmQoJyNicmVha3BvaW50X19jb250YWluZXInKVxyXG4gIH07XHJcblxyXG4gIHRoaXMuZ2V0U2xpZGVyUmVwb3J0ID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRpZXI6IGJwQ29udHJvbGxlci5nZXRBY3RpdmVCcmVha3BvaW50c0NvdW50KCksXHJcbiAgICAgIGNvdW50OiBjdXJyZW50VmFsdWUsXHJcbiAgICAgIHRvdGFsV2VpZ2h0OiAkY291bnQudGV4dCgpLFxyXG4gICAgICByYXRpb25zOiAkcmF0aW9ucy50ZXh0KClcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBCcmVha3BvaW50KF8kY29udGFpbmVyLGljb24sbGVmdE9mZnNldCxjbGFzc05hbWUpIHtcclxuICAgIHZhciAkY29udGFpbmVyID0gXyRjb250YWluZXIsXHJcbiAgICAgICRib2R5LFxyXG4gICAgICBzZWxmID0gdGhpcztcclxuXHJcbiAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICRib2R5ID0gJCgnPGRpdi8+Jyx7XHJcbiAgICAgICAgY2xhc3M6IFwiYnJlYWtwb2ludCBcIiArIChjbGFzc05hbWUgPyBjbGFzc05hbWUgOiAnZGVmYXVsdCcpLFxyXG4gICAgICAgIHN0eWxlOlwibGVmdDpcIitsZWZ0T2Zmc2V0fSlcclxuICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6J2JyZWFrcG9pbnRfX2xpbmUnfSksXHJcbiAgICAgICAgICBpY29uXHJcbiAgICAgICAgKTtcclxuICAgICAgJGJvZHkuYXBwZW5kVG8oJGNvbnRhaW5lcilcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5pc0FjdGl2ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIHJldHVybiAkYm9keS5oYXNDbGFzcygnYWN0aXZlJylcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICRib2R5LmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmRlYWN0aXZhdGUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAkYm9keS5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICAgIH07XHJcblxyXG4gICAgKGZ1bmN0aW9uKCl7XHJcbiAgICAgIHNlbGYucmVuZGVyKCk7XHJcbiAgICB9KSgpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBCcmVha1BvaW50Q29udGFpbmVyKGFycmF5T2ZWYWx1ZXMscGFyZW50KXtcclxuICAgIHZhciBzZWxmQ29udGFpbmVyID0gcGFyZW50LmdldEJyZWFrcG9pbnRDb250YWluZXIoKSxcclxuICAgICAgYnJlYWtQb2ludEFycmF5ID0gW10sXHJcbiAgICAgIGJyZWFrUG9pbnRWYWx1ZXNBcnJheSA9IGFycmF5T2ZWYWx1ZXMgfHwgW10sXHJcbiAgICAgIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgIHRoaXMuZ2V0QWN0aXZlQnJlYWtwb2ludHNDb3VudCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciBjb3VudCA9IDA7XHJcbiAgICAgIGJyZWFrUG9pbnRBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgaWYoIGl0ZW0uaXNBY3RpdmUoKSApXHJcbiAgICAgICAgICBjb3VudCArKztcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBjb3VudDtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5jcmVhdGVCUCA9IGZ1bmN0aW9uKGljb24sb2Zmc2V0TGVmdCxjbGFzc05hbWUpe1xyXG4gICAgICBpZighb2Zmc2V0TGVmdCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBicmVha1BvaW50QXJyYXkucHVzaChcclxuICAgICAgICBuZXcgQnJlYWtwb2ludChzZWxmQ29udGFpbmVyLGljb24sb2Zmc2V0TGVmdCxjbGFzc05hbWUpXHJcbiAgICAgIClcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBjbGFzc05hbWUgPSAnJztcclxuICAgICAgYnJlYWtQb2ludFZhbHVlc0FycmF5LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICBjbGFzc05hbWUgPSAnZGVmYXVsdCc7XHJcbiAgICAgICAgaWYoJ2NsYXNzTmFtZScgaW4gaXRlbSlcclxuICAgICAgICAgY2xhc3NOYW1lID0gaXRlbS5jbGFzc05hbWU7XHJcbiAgICAgICAgc2VsZi5jcmVhdGVCUCggaXRlbS5pY29uLGdldE9mZnNldEluUGVyY2VudChpdGVtLnZhbHVlKSxjbGFzc05hbWUgKVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zZWxlY3RBbGxicmVha3BvaW50c0xlc3NUaGFuVmFsdWUgPSBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgIGJyZWFrUG9pbnRWYWx1ZXNBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLGkpIHtcclxuICAgICAgICBpZiggdmFsdWUgPj0gaXRlbS52YWx1ZSApXHJcbiAgICAgICAgICBicmVha1BvaW50QXJyYXlbaV0uYWN0aXZhdGUoKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBicmVha1BvaW50QXJyYXlbaV0uZGVhY3RpdmF0ZSgpO1xyXG4gICAgICB9KVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmRlc2VsZWN0QWxsYnJlYWtwb2ludHMgPSBmdW5jdGlvbigpe1xyXG4gICAgICBicmVha1BvaW50QXJyYXkuZm9yRWFjaChmdW5jdGlvbihicmVha3BvaW50KXtcclxuICAgICAgICBicmVha3BvaW50LmRlYWN0aXZhdGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldE9mZnNldEluUGVyY2VudChiclBvaW50KXtcclxuICAgICAgdmFyIG9uZVN0ZXA7XHJcbiAgICAgIHZhciB0b3RhbCA9IHBhcmVudC5tYXhSYW5nZVZhbHVlKCkgLSBwYXJlbnQubWluUmFuZ2VWYWx1ZSgpO1xyXG4gICAgICBpZiAodG90YWwgPiA1MClcclxuICAgICAgICBvbmVTdGVwID0gKyhwYXJlbnQucmFuZ2VTdGVwVmFsdWUoKSAvIDAuNSkudG9GaXhlZCgyMCk7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBvbmVTdGVwID0gKyhwYXJlbnQucmFuZ2VTdGVwVmFsdWUoKS8gKHRvdGFsIC8gMTAwKSkudG9GaXhlZCgyMCk7XHJcbiAgICAgIHZhciBvZmZzZXQgPSArKCBvbmVTdGVwICogKGJyUG9pbnQtMSkgLyogKGJyUG9pbnQtMzItMikqLyApLnRvRml4ZWQoMjApO1xyXG4gICAgICByZXR1cm4gb2Zmc2V0ICsgJyUnXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAoZnVuY3Rpb24oKXtcclxuICAgIHNlbGYucmVuZGVyKCk7XHJcbiAgfSkoKVxyXG59XG4vKipcclxuICog0JPQsNC70LvQtdGA0LXRjyDQuNC30L7QsdGA0LDQttC10L3QuNC5INCyINC+0LHQt9C+0YDQtSDRgtC+0LLQsNGA0LBcclxuICogQHBhcmFtcyB7b2JqZWN0fSBwYXJhbXNcclxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuY29udGFpbmVyXHJcbiAqIEBwYXJhbSAge251bWJlcn0gcGFyYW1zLmlkICAgICAgICAgLSDQmNCUINC/0YDQvtC00YPQutGC0LBcclxuICogQHBhcmFtICB7c3RyaW5nfSBwYXJhbXMudGh1bWIgICAgICAtINGB0YHRi9C70LrQsCDQvdCwINCz0LvQsNCy0L3QvtC1INC40LfQvtCx0YDQsNC20LXQvdC40LUg0YLQvtCy0LDRgNCwXHJcbiAqIEBwYXJhbSAge3N0cmluZ30gcGFyYW1zLm5hbWUgICAgICAgLSDQvdCw0LjQvNC10L3QvtCy0LDQvdC40LUg0YLQvtCy0LDRgNCwXHJcbiAqIEBwYXJhbSAge1tdfSAgICAgcGFyYW1zLmltYWdlTGlzdCAgLSDRgdC/0LjRgdC+0Log0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvRhSDQuNC30L7QsdGA0LDQttC10L3QuNC5INGC0L7QstCw0YDQsFxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFJldmlld0dhbGxlcnkocGFyYW1zKXtcclxuICBsZXQgY29udGFpbmVyICAgICAgICAgICAgID0gcGFyYW1zLmNvbnRhaW5lcixcclxuICAgIGlkICAgICAgICAgICAgICAgICAgICAgID0gcGFyYW1zLmlkLFxyXG4gICAgc2hvd0dhbGxlcnlPZlRodW1ibmFpbHMgPSBwYXJhbXMuc2hvd0dhbGxlcnlPZlRodW1ibmFpbHMgfHwgdHJ1ZSxcclxuICAgIHRodW1ibmFpbHNDYXB0aW9uICAgICAgID0gcGFyYW1zLnRodW1ibmFpbHNDYXB0aW9uLFxyXG4gICAgdGh1bWIgICAgICAgICAgICAgICAgICAgPSBwYXJhbXMudGh1bWIsXHJcbiAgICBuYW1lICAgICAgICAgICAgICAgICAgICA9IHBhcmFtcy5uYW1lIHx8IFwibWluaS1nYWxsZXJ5XCIsXHJcbiAgICBpbWFnZUxpc3QgICAgICAgICAgICAgICA9IHBhcmFtcy5pbWFnZUxpc3QgfHwgW10sXHJcbiAgICBzZWxmICAgICAgICAgICAgICAgICAgICA9IHRoaXMsXHJcbiAgICBib2R5O1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0KHQvtC30LTQsNGC0Ywg0LrQvtC90YLQtdC50L3QtdGAINC00LvRjyDQuNC30L7QsdGA0LDQttC10L3QuNGPXHJcbiAgICogQHBhcmFtIHNyYyAgICAgICAtINC/0YPRgtGMINC6INC40LfQvtCx0YDQsNC20LXQvdC40Y5cclxuICAgKiBAcGFyYW0gY2xhc3NOYW1lIC0g0LrQsNGB0YLQvtC80L3Ri9C5INC60LvQsNGB0YEg0LTQu9GPINC60L7QvdGC0LXQudC90LXRgNCwXHJcbiAgICogQHJldHVybiB7dm9pZHwqfGpRdWVyeX1cclxuICAgKi9cclxuICBmdW5jdGlvbiBpbWFnZShzcmMsY2xhc3NOYW1lKXtcclxuICAgIHJldHVybiAkKCc8YS8+Jyx7XHJcbiAgICAgIGNsYXNzOiBcInN0b2NrX19wcm9kdWN0IFwiKyBjbGFzc05hbWUsXHJcbiAgICAgIGlkOiBcInByb2R1Y3RfX1wiK2lkLFxyXG4gICAgICBocmVmOiBzcmMsXHJcbiAgICAgICdkYXRhLXRvZ2dsZSc6J2xpZ2h0Ym94JyxcclxuICAgICAgJ2RhdGEtZ2FsbGVyeSc6IG5hbWUgKyAnLScgKyBpZCxcclxuICAgICAgJ2RhdGEtd2lkdGgnOiAnODAwcHgnLFxyXG4gICAgICAnZGF0YS1oZWlnaHQnOic4MDBweCcsXHJcbiAgICB9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgICQoJzxkaXYvPicse2NsYXNzOid0ZXRyYWdvbi0xMid9KVxyXG4gICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6ICd0ZXRyYWdvbl9fd3JhcHBlcid9KVxyXG4gICAgICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczogJ3RldHJhZ29uX19jb250ZW50J30pXHJcbiAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnPGltZy8+Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgc3JjOiBzcmMsXHJcbiAgICAgICAgICAgICAgICAgICAgICBhbHQ6IG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAnb25lcnJvcic6ICckKHRoaXMpLmFkZENsYXNzKFwiaW52YWxpZC1pbWFnZS1zcmNcIiknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICdwcm9kdWN0X190aHVtYiBkLWJsb2NrIGgtMTAwIHctMTAwJyxcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgKVxyXG4gICAgICApXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JTQvtCx0LDQstC40YLRjCDQs9Cw0LvQu9C10YDQtdGOINC80LjQvdC40LDRgtGO0YAuINCh0LXRgtC60LAgMypuINC40LfQvtCx0YDQsNC20LXQvdC40LkuXHJcbiAgICog0J/RgNC4INC60LDQttC00L7QvCDRgdC+0LfQtNCw0L3QuNC4INCz0LDQu9C70LXRgNC10Lgg0LjQt9C+0LHRgNCw0LbQtdC90LjRjyDQv9C10YDQtdC80LXRiNC40LLQsNGO0YLRgdGPINCyINGA0LDQvdC00L7QvNC90L7QvCDQv9C+0YDRj9C00LrQtVxyXG4gICAqINCV0YHQu9C4INGD0LrQsNC30LDQvSDQv9Cw0YDQsNC80LXRgtGAIDxzdHJvbmc+c2hvd0dhbGxlcnlPZlRodW1ibmFpbHMgPSBmYWxzZTwvc3Ryb25nPiDQs9Cw0LvQu9C10YDQtdGPINC90LUg0LHRg9C00LXRgiDQstGL0LLQvtC00LjRgtGB0Y9cclxuICAgKiBAcmV0dXJuIHtib29sZWFufGpRdWVyeX1cclxuICAgKi9cclxuICBmdW5jdGlvbiBnYWxsZXJ5T2ZUaHVtYm5haWxzKCl7XHJcbiAgICBpZighc2hvd0dhbGxlcnlPZlRodW1ibmFpbHMpIHJldHVybiBmYWxzZTtcclxuICAgIGltYWdlTGlzdCA9IGNvbW1vbi5yYW5kb21pemVBcnJheShpbWFnZUxpc3QpO1xyXG4gICAgdmFyICRhID0gJCgnPGRpdi8+Jyx7Y2xhc3M6J3JvdyBnYWxsZXJ5LW9mLXRodW1ibmFpbHMgcC0zJ30pXHJcbiAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgJCgnPGg0Lz4nLHt0ZXh0OnRodW1ibmFpbHNDYXB0aW9uLGNsYXNzOidkLWJsb2NrIHctMTAwJ30pXHJcbiAgICAgICk7XHJcbiAgICBmb3IodmFyIGk9MDtpPDQ7aSsrKXtcclxuICAgICAgJGEuYXBwZW5kKFxyXG4gICAgICAgIGltYWdlKGltYWdlTGlzdFtpXS50aHVtYiwnY29sLTMgcC0xJylcclxuICAgICAgKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuICRhO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCe0YLRgNC40YHQvtCy0LDRgtGMINC60L7QvNC/0L7QvdC10L3RglxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHJlbmRlcigpe1xyXG4gICAgYm9keSA9ICQoJzxkaXYvPicse2NsYXNzOidwcm9kdWN0LXJldmlld19fZ2FsbGVyeS1jb250ZW50IG1iLTQnfSlcclxuICAgICAgLmFwcGVuZChcclxuICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczoncm93IHByb2R1Y3QtcmV2aWV3X19wcmltYXJ5LWdhbGxlcnknfSlcclxuICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgIGltYWdlKHRodW1iLCdjb2wtMTInKVxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczoncHJvZHVjdC1yZXZpZXdfX3NlY29uZGFyeS1nYWxsZXJ5IHctMTAwJ30pXHJcbiAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICBnYWxsZXJ5T2ZUaHVtYm5haWxzKClcclxuICAgICAgICAgIClcclxuICAgICAgKTtcclxuICAgICQoY29udGFpbmVyKS5lbXB0eSgpOyAvL9C+0YfQuNGB0YLQuNC8INC60L7QvdGC0LXQudC90LXRgCDRh9GC0L7QsdGLINC40LfQsdC10LbQsNGC0Ywg0LTRg9Cx0LvQuNGA0L7QstCw0L3QuNGPXHJcbiAgICBib2R5LmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcbiAgICBib2R5Lm9uKCdjbGljaycsICdbZGF0YS10b2dnbGU9XCJsaWdodGJveFwiXScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICQodGhpcykuZWtrb0xpZ2h0Ym94KHtcclxuICAgICAgICBvbkhpZGRlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAvLyQoJ2JvZHknKS5hZGRDbGFzcygnbW9kYWwtb3BlbicpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAoZnVuY3Rpb24oKXtcclxuICAgIHJlbmRlcigpO1xyXG4gIH0pKClcclxufVxuLyoqXHJcbiAqINCY0L3RhNC+0YDQvNCw0YbQuNGPINC+INGC0L7QstCw0YDQtVxyXG4gKiBAcGFyYW1zIHtvYmplY3R9IHBhcmFtc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFJldmlld0luZm8ocGFyYW1zKXtcclxuICBsZXQgY29udGFpbmVyICAgICA9IHBhcmFtcy5jb250YWluZXIsXHJcbiAgICBpZCAgICAgICAgICAgICAgPSBwYXJhbXMuaWQsXHJcbiAgICBuYW1lICAgICAgICAgICAgPSBwYXJhbXMubmFtZSxcclxuICAgIGRlc2NyaXB0aW9uICAgICA9IHBhcmFtcy5kZXNjcmlwdGlvbixcclxuICAgIG1pbmltdW1PcmRlciAgICA9IHBhcmFtcy5taW5pbXVtT3JkZXIsXHJcbiAgICBjb3N0ICAgICAgICAgICAgPSBwYXJhbXMuY29zdCxcclxuICAgIG5vdGUgICAgICAgICAgICA9IHBhcmFtcy5ub3RlLFxyXG4gICAgc3RlcCAgICAgICAgICAgID0gcGFyYW1zLnN0ZXAsXHJcbiAgICB3ZWlnaHQgICAgICAgICAgPSBwYXJhbXMud2VpZ2h0LFxyXG4gICAgbWluICAgICAgICAgICAgID0gcGFyYW1zLm1pbixcclxuICAgIG1heCAgICAgICAgICAgICA9IHBhcmFtcy5tYXgsXHJcbiAgICByYXRpb24gICAgICAgICAgPSBwYXJhbXMucmF0aW9uLFxyXG4gICAgdGFzdGVMaXN0ICAgICAgID0gcGFyYW1zLnRhc3RlTGlzdCB8fCBudWxsLFxyXG4gICAgZGVjb3JDYXB0aW9uICAgID0gcGFyYW1zLmRlY29yQ2FwdGlvbixcclxuICAgIGRlY29yTGlzdCAgICAgICA9IHBhcmFtcy5kZWNvckxpc3QgfHwgbnVsbCxcclxuICAgIHNpemVMaXN0ICAgICAgICA9IHBhcmFtcy5zaXplTGlzdCAgfHwgbnVsbCxcclxuICAgIGFkU3R1ZmZpbmdMaXN0ICA9IHBhcmFtcy5hZFN0dWZmaW5nTGlzdCB8fCBudWxsLFxyXG4gICAgb3JkZXJDb21wbGV0aW9uID0gcGFyYW1zLm9yZGVyQ29tcGxldGlvbiB8fCBudWxsLFxyXG4gICAgYnJlYWtwb2ludHMgICAgID0gcGFyYW1zLmJyZWFrcG9pbnRzLFxyXG4gICAgbm9PcHRpb25zICAgICAgID0gcGFyYW1zLm5vT3B0aW9ucyxcclxuICAgIHNsaWRlck9wdCAgICAgICA9IHtcclxuICAgICAgaW5kZXg6IGlkLFxyXG4gICAgICBjYXB0aW9uOiAnJyxcclxuICAgICAgcHJvZHVjdHNJblJhdGlvbjogcmF0aW9uLFxyXG4gICAgICBtaW46IG1pbixcclxuICAgICAgbWF4OiBtYXgsXHJcbiAgICAgIHN0ZXA6IHN0ZXAsXHJcbiAgICAgIHdlaWdodDogd2VpZ2h0LFxyXG4gICAgICBicmVha3BvaW50czogYnJlYWtwb2ludHNcclxuICAgIH0sXHJcbiAgICB2YXJpYW50c09mRXhlY3V0aW9uPSBwYXJhbXMudmFyaWFudHNPZkV4ZWN1dGlvbiB8fCBmYWxzZSxcclxuICAgIG9wdGlvbnNMaXN0ID0gW10sXHJcbiAgICBib2R5LFxyXG4gICAgcGVyc29uTW9kYWwsXHJcbiAgICBzbGlkZXI7XHJcblxyXG4gIC8qKlxyXG4gICAqINCU0L7QsdCw0LLQuNGC0Ywg0YHRgtGA0L7QutGDINGF0LDRgNCw0LrRgtC10YDQuNGB0YLQuNC60Lgg0L/RgNC+0LTRg9C60YLQsFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgZmllbGROYW1lICAgLSDQuNC80Y8g0L/QvtC70Y8g0LTQu9GPINC+0YLQv9GA0LDQstC60LhcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gIGNsYXNzTmFtZSAgIC0g0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvQuSDQutC70LDRgdGBXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9ICB0ZXh0ICAgICAgICAtINC90LDQuNC80LXQvdC+0LLQsNC90LjQtSDRhdCw0YDQsNC60YLQtdGA0LjRgdGC0LjQutC4XHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc1NlcGFyYXRlZCAtINGE0LvQsNCzINC+0L/RgNC10LTQtdC70Y/RjtGJ0LjQuSDRgtGA0LXQsdGD0LXRgtGB0Y8g0LvQuCDQv9C+0LrQsNC30YvQstCw0YLRjCDQvdC40LbQvdGO0Y4g0LPRgNCw0L3QuNGG0YMg0L/QvtC0INGF0LDRgNCw0LrRgtC10YDQuNGB0YLQuNC60L7QuVxyXG4gICAqIEByZXR1cm4geyp8dm9pZHxqUXVlcnl9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZmVhdHVyZVJvdyhmaWVsZE5hbWUsY2xhc3NOYW1lLHRleHQsaXNTZXBhcmF0ZWQpe1xyXG4gICAgdmFyIGJvcmRlcmVkID0gIGlzU2VwYXJhdGVkID09PSB0cnVlID8gJyBib3JkZXItYm90dG9tIHRleHQtcmlnaHQnIDogJyc7XHJcbiAgICByZXR1cm4gJCgnPGRpdi8+Jyx7Y2xhc3M6J3Jvdyd9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgICQoJzxkaXYvPicse2NsYXNzOidjb2wtMTIgJytjbGFzc05hbWUrJy1jb250YWluZXInICsgYm9yZGVyZWR9KVxyXG4gICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgJCgnPHNwYW4vPicse1xyXG4gICAgICAgICAgICAgIGNsYXNzOmNsYXNzTmFtZSxcclxuICAgICAgICAgICAgICB0ZXh0OnRleHQsXHJcbiAgICAgICAgICAgICAgbmFtZTogZmllbGROYW1lfSlcclxuICAgICAgICAgIClcclxuICAgICAgKVxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCU0L7QsdCw0LLQuNGC0Ywg0YHRgtGA0L7QutGDINC+0L/RhtC40Lkg0YLQvtCy0LDRgNCwXHJcbiAgICogQHBhcmFtIGNsYXNzTmFtZVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZE9yZGVyT3B0aW9uUm93KGNsYXNzTmFtZSl7XHJcbiAgICAkKCc8ZGl2Lz4nLHtjbGFzczogJ3Byb2R1Y3QtcmV2aWV3X19vcmRlci1vcHRpb24gJytjbGFzc05hbWUrJyBtdC0zJ30pLmFwcGVuZFRvKGJvZHkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZW5kZXIoKXtcclxuXHJcbiAgICBib2R5ID0gJCgnPGRpdi8+Jyx7aWQ6IGlkLGNsYXNzOiAncHJvZHVjdC1yZXZpZXdfX2luZm8tY29udGVudCd9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgIGZlYXR1cmVSb3coJ25hbWUnLCdwcm9kdWN0LXJldmlld19fbmFtZScsIG5hbWUsIHRydWUgKSxcclxuICAgICAgICBmZWF0dXJlUm93KCdkZXNjcmlwdGlvbicsJ3Byb2R1Y3QtcmV2aWV3X19kZXNjcmlwdGlvbiAhcHJvZHVjdC1yZXZpZXdfX21pbi1oZWlnaHQgcGItNScsIGRlc2NyaXB0aW9uICksXHJcbiAgICAgICAgZmVhdHVyZVJvdygnbWluT3JkZXInLCAncHJvZHVjdC1yZXZpZXdfX21pbmltdW0tb3JkZXIgJywn0JzQuNC90LjQvNCw0LvRjNC90YvQuSDQt9Cw0LrQsNC3OiAnICsgbWluaW11bU9yZGVyICApLFxyXG4gICAgICAgIGZlYXR1cmVSb3coJ21pbkNvc3QnLCAncHJvZHVjdC1yZXZpZXdfX2Nvc3QnLCAn0KbQtdC90LAg0LfQsCAxICcgKyAoIG1pbmltdW1PcmRlci5zcGxpdCgnICcpWzFdID8gbWluaW11bU9yZGVyLnNwbGl0KCcgJylbMV0gOiAnINC60YPRgdC+0LonICkgKyAnINC+0YIgJytjb3N0KycgQllOJyApLFxyXG4gICAgICApO1xyXG5cclxuICAgICQoY29udGFpbmVyKS5lbXB0eSgpO1xyXG4gICAgYm9keS5hcHBlbmRUbyhjb250YWluZXIpO1xyXG5cclxuICAgIHBlcnNvbk1vZGFsID0gbmV3IFBlcnNvbkNhcmRNb2RhbCh7XHJcbiAgICAgIGNvbnRhaW5lcjogYm9keVxyXG4gICAgfSk7XHJcbiAgICAkKCdib2R5Jykub2ZmKCdwZXJzb25Nb2RhbENsb3NlZCcpLm9uKCdwZXJzb25Nb2RhbENsb3NlZCcsZnVuY3Rpb24oZSxkKXtcclxuICAgICAgY29uc29sZS5sb2coZSxkKTtcclxuICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ29yZGVyQ2xvc2VkJyxbZCxjb2xsZWN0QWxsRGF0YSgpXSk7XHJcbiAgICB9KTtcclxuICAgIC8v0JXRgdC70Lgg0YPQutCw0LfQsNC90Ysg0LLQutGD0YHRiyA6OiDRgdC+0LfQtNCw0YLRjCDQutC+0LzQv9C+0L3QtdC90YIgXCLQktGL0LHQvtGAINCy0LrRg9GB0LBcIlxyXG4gICAgaWYoIGlzVGFzdGVzU3BlY2lmaWVkKCkgKXtcclxuICAgICAgb3B0aW9uc0xpc3QucHVzaChcclxuICAgICAgICBhZGRDb21wb25lbnRUYXN0ZVNlbGVjdCgpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAvL9CV0YHQu9C4INGD0LrQsNC30LDQvdGLINC00L7Qv9C+0LvQvdC10L3QuNGPINC6INC90LDRh9C40L3QutC1IDo6INGB0L7Qt9C00LDRgtGMINC60L7QvNC/0L7QvdC10L3RgiBcItCU0L7Qv9C+0LvQvdC10L3QuNGPINC6INC90LDRh9C40L3QutC1XCJcclxuICAgIGlmKCBpc0FkZGl0aW9uYWxTdHVmZmluZ1NwZWNpZmllZCgpICl7XHJcbiAgICAgIG9wdGlvbnNMaXN0LnB1c2goXHJcbiAgICAgICAgYWRkQ29tcG9uZW50QWRkaXRpb25hbFN0dWZmaW5nU2VsZWN0KClcclxuICAgICAgKVxyXG4gICAgfVxyXG4gICAgLy/QldGB0LvQuCDRg9C60LDQt9Cw0L3RiyDQstCw0YDQuNCw0L3RgtGLINC00LXQutC+0YDQsCA6OiDRgdC+0LfQtNCw0YLRjCDQutC+0LzQv9C+0L3QtdC90YIgXCLQntGE0L7RgNC80LvQtdC90LjRj1wiXHJcbiAgICBpZiggaXNEZWNvclNwZWNpZmllZCgpICl7XHJcbiAgICAgIG9wdGlvbnNMaXN0LnB1c2goXHJcbiAgICAgICAgYWRkQ29tcG9uZW50RGVjb3JTZWxlY3QoKVxyXG4gICAgICApXHJcbiAgICB9XHJcbiAgICAvL9CV0YHQu9C4INGD0LrQsNC30LDQvdGLINCy0LDRgNC40LDQvdGC0Ysg0YDQsNC30LzQtdGA0L7QsiA6OiDRgdC+0LfQtNCw0YLRjCDQutC+0LzQv9C+0L3QtdC90YIgXCLQoNCw0LfQvNC10YDRi1wiXHJcbiAgICBpZiggaXNTaXplc1NwZWNpZmllZCgpICl7XHJcbiAgICAgIG9wdGlvbnNMaXN0LnB1c2goXHJcbiAgICAgICAgYWRkQ29tcG9uZW50U2l6ZVNlbGVjdCgpXHJcbiAgICAgIClcclxuICAgIH1cclxuICAgIC8v0KHQvtC30LTQsNGC0Ywg0LrQvtC80L/QvtC90LXQvdGCIFwi0JrQvtC80LzQtdC90YLQsNGA0LjQuFwiXHJcbiAgICBvcHRpb25zTGlzdC5wdXNoKFxyXG4gICAgICBhZGRDb21wb25lbnROb3RpZmljYXRpb24oKVxyXG4gICAgKTtcclxuICAgIC8v0KHQvtC30LTQsNGC0Ywg0LrQvtC80L/QvtC90LXQvdGCIFwi0JjQt9C+0LHRgNCw0LbQtdC90LjRj1wiXHJcbiAgICBvcHRpb25zTGlzdC5wdXNoKFxyXG4gICAgICBhZGRDb21wb25lbnRJbWFnZSgpXHJcbiAgICApO1xyXG4gICAgLy/QodC+0LfQtNCw0YLRjCDQutC90L7Qv9C60YMgXCLQntGE0L7RgNC80LjRgtGMINC30LDRj9Cy0LrRg1wiXHJcbiAgICBhZGRUb3RhbEJ1dHRvbigpO1xyXG4gICAgLy/QodC+0LfQtNCw0YLRjCDQutC+0LzQv9C+0L3QtdC90YIgXCLQoNC10LrQvtC80LXQvdC00YPQtdC80YvQtSDRgtC+0LLQsNGA0YtcIlxyXG4gICAgYWRkQ29tcG9uZW50UmVjb21tZW5kZWRQcm9kdWN0KCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0J/RgNC+0LLQtdGA0LjRgtGMINGD0LrQsNC30LDQvdGLINC70Lgg0LLQsNGA0LjQsNC90YLRiyDQstGL0LHQvtGA0LAg0LLQutGD0YHQsFxyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaXNUYXN0ZXNTcGVjaWZpZWQoKXtcclxuICAgIHJldHVybiAhIXRhc3RlTGlzdCAmJiB0eXBlb2YgdGFzdGVMaXN0ID09PSAnb2JqZWN0JyAmJiB0YXN0ZUxpc3QubGVuZ3RoICE9PSAwXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JTQvtCx0LDQstC40YLRjCDQutC+0LzQv9C+0L3QtdC90YIg0LLRi9Cx0L7RgNCwINCy0LrRg9GB0L7QslxyXG4gICAqIEByZXR1cm4ge0NvbXBvbmVudFRhc3RlfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZENvbXBvbmVudFRhc3RlU2VsZWN0KCl7XHJcbiAgICBhZGRPcmRlck9wdGlvblJvdyhcIm9wdGlvbl9fY2hvb3NlLXRhc3RlXCIpO1xyXG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnRUYXN0ZSh7XHJcbiAgICAgIGNvbnRhaW5lcjogYm9keS5maW5kKFwiLm9wdGlvbl9fY2hvb3NlLXRhc3RlXCIpLFxyXG4gICAgICBwcm9kdWN0SWQ6IGlkLFxyXG4gICAgICB0YXN0ZUxpc3Q6IHRhc3RlTGlzdCxcclxuICAgICAgc2xpZGVyT3B0OiBzbGlkZXJPcHRcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCf0YDQvtCy0LXRgNC40YLRjCDRg9C60LDQt9Cw0L3RiyDQu9C4INCy0LDRgNC40LDQvdGC0Ysg0LLRi9Cx0L7RgNCwINC+0YTQvtGA0LzQu9C10L3QuNGPXHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBmdW5jdGlvbiBpc0RlY29yU3BlY2lmaWVkKCl7XHJcbiAgICByZXR1cm4gISFkZWNvckxpc3QgJiYgdHlwZW9mIGRlY29yTGlzdCA9PT0gXCJvYmplY3RcIiAmJiBkZWNvckxpc3QubGVuZ3RoICE9PSAwXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JTQvtCx0LDQstC40YLRjCDQutC+0LzQv9C+0L3QtdC90YIg0LTQu9GPINCy0YvQsdC+0YDQsCDQstCw0YDQuNCw0L3RgtC+0LIg0L7RhNC+0YDQvNC70LXQvdC40Y9cclxuICAgKiBAcmV0dXJuIHtDb21wb25lbnREZWNvcn1cclxuICAgKi9cclxuICBmdW5jdGlvbiBhZGRDb21wb25lbnREZWNvclNlbGVjdCgpe1xyXG4gICAgYWRkT3JkZXJPcHRpb25Sb3coXCJvcHRpb25fX2Nob29zZS1kZWNvclwiKTtcclxuICAgIHJldHVybiBuZXcgQ29tcG9uZW50RGVjb3Ioe1xyXG4gICAgICBjb250YWluZXI6IGJvZHkuZmluZCgnLm9wdGlvbl9fY2hvb3NlLWRlY29yJyksXHJcbiAgICAgIHByb2R1Y3RJZDogaWQsXHJcbiAgICAgIGRlY29yTGlzdDogZGVjb3JMaXN0LFxyXG4gICAgICBjYXB0aW9uICA6IGRlY29yQ2FwdGlvblxyXG4gICAgfSlcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQn9GA0L7QstC10YDQuNGC0Ywg0YPQutCw0LfQsNC90Ysg0LvQuCDQstCw0YDQuNCw0L3RgtGLINCy0YvQsdC+0YDQsCDQtNC+0L/QvtC70L3QtdC90LjRjyDQuiDQvdCw0YfQuNC90LrQtVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGlzQWRkaXRpb25hbFN0dWZmaW5nU3BlY2lmaWVkKCl7XHJcbiAgICByZXR1cm4gISFhZFN0dWZmaW5nTGlzdCAmJiB0eXBlb2YgYWRTdHVmZmluZ0xpc3QgPT09ICdvYmplY3QnICYmIGFkU3R1ZmZpbmdMaXN0Lmxlbmd0aCAhPT0gMFxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCU0L7QsdCw0LLQuNGC0Ywg0LrQvtC80L/QvtC90LXQvdGCINC00LvRjyDQstGL0LHQvtGA0LAg0LTQvtC/0L7Qu9C90LXQvdC40Y8g0LIg0L3QsNGH0LjQvdC60LVcclxuICAgKiBAcmV0dXJucyB7Q29tcG9uZW50QWRkaXRpb25hbFN0dWZmaW5nfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZENvbXBvbmVudEFkZGl0aW9uYWxTdHVmZmluZ1NlbGVjdCgpe1xyXG4gICAgYWRkT3JkZXJPcHRpb25Sb3coJ29wdGlvbl9fY2hvb3NlLWFkZGl0aW9uYWxTdHVmZmluZycpO1xyXG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnRBZGRpdGlvbmFsU3R1ZmZpbmcoe1xyXG4gICAgICBjb250YWluZXI6IGJvZHkuZmluZCgnLm9wdGlvbl9fY2hvb3NlLWFkZGl0aW9uYWxTdHVmZmluZycpLFxyXG4gICAgICBwcm9kdWN0SWQ6IGlkLFxyXG4gICAgICBhZGRpdGlvbmFsU3R1ZmZpbmdMaXN0OiBhZFN0dWZmaW5nTGlzdFxyXG4gICAgfSlcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQn9GA0L7QstC10YDQuNGC0Ywg0YPQutCw0LfQsNC90Ysg0LvQuCDRgNCw0LdcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBmdW5jdGlvbiBpc1NpemVzU3BlY2lmaWVkKCl7XHJcbiAgICByZXR1cm4gISFzaXplTGlzdCAmJiB0eXBlb2Ygc2l6ZUxpc3QgPT09IFwib2JqZWN0XCIgJiYgc2l6ZUxpc3QubGVuZ3RoICE9PSAwXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JTQvtCx0LDQstC40YLRjCDQutC+0LzQv9C+0L3QtdC90YIg0LTQu9GPINCy0YvQsdC+0YDQsCDRgNCw0LfQvNC10YDQsCDQs9C+0YLQvtCy0L7Qs9C+INC/0YDQvtC00YPQutGC0LBcclxuICAgKiBAcmV0dXJucyB7Q29tcG9uZW50U2l6ZX1cclxuICAgKi9cclxuICBmdW5jdGlvbiBhZGRDb21wb25lbnRTaXplU2VsZWN0KCl7XHJcbiAgICBhZGRPcmRlck9wdGlvblJvdygnb3B0aW9uX19jaG9vc2Utc2l6ZScpO1xyXG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnRTaXplKHtcclxuICAgICAgY29udGFpbmVyOiBib2R5LmZpbmQoJy5vcHRpb25fX2Nob29zZS1zaXplJyksXHJcbiAgICAgIHByb2R1Y3RJZDogaWQsXHJcbiAgICAgIHNpemVMaXN0OiBzaXplTGlzdFxyXG4gICAgfSlcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQlNC+0LHQsNCy0LjRgtGMINC60L7QvNC/0L7QvdC10L3RgiDQtNC70Y8g0LLQstC+0LTQsCDQutC+0LzQvNC10L3RgtCw0YDQuNGPXHJcbiAgICogQHJldHVybnMge0NvbXBvbmVudE5vdGlmaWNhdGlvbn1cclxuICAgKi9cclxuICBmdW5jdGlvbiBhZGRDb21wb25lbnROb3RpZmljYXRpb24oKXtcclxuICAgIGFkZE9yZGVyT3B0aW9uUm93KCdvcHRpb25fX25vdGlmaWNhdGlvbicpO1xyXG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnROb3RpZmljYXRpb24oe1xyXG4gICAgICBjb250YWluZXI6IGJvZHkuZmluZCgnLm9wdGlvbl9fbm90aWZpY2F0aW9uJyksXHJcbiAgICAgIHByb2R1Y3RJZDogaWQsXHJcbiAgICAgIHRleHQ6IG5vdGVcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JTQvtCx0LDQstC40YLRjCDQutC+0LzQv9C+0L3QtdC90YIg0LTQu9GPINC30LDRgNCz0YPQt9C60Lgg0LjQt9C+0LHRgNCw0LbQtdC90LjRj1xyXG4gICAqIEByZXR1cm5zIHtDb21wb25lbnRJbWFnZX1cclxuICAgKi9cclxuICBmdW5jdGlvbiBhZGRDb21wb25lbnRJbWFnZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnRJbWFnZSh7XHJcbiAgICAgIGNvbnRhaW5lcjogYm9keS5jbG9zZXN0KCcucHJvZHVjdC1yZXZpZXdfX2Zvcm0nKSxcclxuICAgICAgcHJvZHVjdElkOiBpZFxyXG4gICAgfSlcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQlNC+0LHQsNCy0LjRgtGMINC60L7QvNC/0L7QvdC10L3RgiDRgNC10LrQvtC80LXQvdC00YPQtdC80YvRhSDQv9GA0L7QtNGD0LrRgtC+0LJcclxuICAgKi9cclxuICBmdW5jdGlvbiBhZGRDb21wb25lbnRSZWNvbW1lbmRlZFByb2R1Y3QoKSB7XHJcbiAgICAkKCc8ZGl2Lz4nLHtjbGFzczonbXQtNSd9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgIG5ldyBDb21wb25lbnRSZWNvbW1lbmRlZFByb2R1Y3RzKHtcclxuICAgICAgICAgIGNvbnRhaW5lcjogYm9keS5jbG9zZXN0KCcucHJvZHVjdC1yZXZpZXdfX2Zvcm0nKSxcclxuICAgICAgICAgIHByb2R1Y3RJZDogaWQsXHJcbiAgICAgICAgICBjYXB0aW9uOiAn0KEg0Y3RgtC40Lwg0L/RgNC+0LTRg9C60YLQvtC8INC/0L7QutGD0L/QsNGO0YInXHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQlNC+0LHQsNCy0LjRgtGMINC60L3QvtC/0LrRgyBcItCe0YTQvtGA0LzQuNGC0Ywg0LfQsNGP0LLQutGDXCIg0L/RgNC4INC90LXQttCw0YLQuNC4INC90LAg0LrQvtGC0YDRg9GOINCx0YPQtNC10YIg0YHQvtCx0LjRgNCw0YLRjNGB0Y8g0LLRgdGPINC40L3RhNCwINC/0L4g0LLRi9C00LXQu9C10L3QvdGL0LxcclxuICAgKiDQvtC/0YbQuNGP0Lwg0LfQsNGP0LLQutC4INC4INC30LDQv9C40YHRi9Cy0LDRgtGM0YHRjyDQsiDQv9C+0LvQtSDRgSBuYW1lPVwidG90YWxcIlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZFRvdGFsQnV0dG9uKCkge1xyXG4gICAgJCgnPGRpdi8+Jyx7Y2xhc3M6ICdyb3cgcHJvZHVjdC1yZXZpZXdfX3RvdGFsIG10LTUnfSlcclxuICAgICAgLmFwcGVuZChcclxuICAgICAgICAkKCc8aW5wdXQvPicse3R5cGU6J2hpZGRlbicsbmFtZTondG90YWwnfSksXHJcbiAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6J2NvbC0xMiBkLWZsZXgganVzdGlmeS1jb250ZW50LWNlbnRlcid9KVxyXG4gICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgJCgnPGEvPicse1xyXG4gICAgICAgICAgICAgIGlkOiAnc2VuZC10by1uZXh0JyxcclxuICAgICAgICAgICAgICBocmVmOiAnIycsXHJcbiAgICAgICAgICAgICAgY2xhc3M6ICdidG4gYnRuLW91dGxpbmUtcHJpbWFyeSBwLTQnLFxyXG4gICAgICAgICAgICAgIHRleHQ6ICfQntGE0L7RgNC80LjRgtGMINC30LDRj9Cy0LrRgycsXHJcbiAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb2xsZWN0QWxsRGF0YSgpKTtcclxuICAgICAgICAgICAgICAgIHBlcnNvbk1vZGFsLnNob3coKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICApXHJcbiAgICAgIClcclxuICAgICAgLmFwcGVuZFRvKCBib2R5LmNsb3Nlc3QoJy5wcm9kdWN0LXJldmlld19fZm9ybScpICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0KHQvtCx0YDQsNGC0Ywg0LTQsNC90L3Ri9C1INCy0YHQtdGFINC60L7QvNC/0L7QvdC10L3RgtC+0LJcclxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY29sbGVjdEFsbERhdGEoKXtcclxuICAgIHZhciBhID0ge307XHJcbiAgICBvcHRpb25zTGlzdC5mb3JFYWNoKCBpdGVtID0+IHtcclxuICAgICAgaWYoaXRlbSkge1xyXG4gICAgICAgIGFbaXRlbS5jb25zdHJ1Y3Rvci5uYW1lXSA9IGl0ZW0uZ2V0RGF0YSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBhO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCd0LXQvNC10LTQu9C10L3QvdC+0LUg0L/QvtGB0YLRgNC+0LXQvdC40LUg0LrQvtC80L/QvtC90LXQvdGC0LBcclxuICAgKi9cclxuICAoZnVuY3Rpb24oKXtcclxuICAgIHJlbmRlcigpO1xyXG4gIH0pKClcclxufVxuLyoqXHJcbiAqINCS0LjRgtGA0LjQvdCwXHJcbiAqIEBwYXJhbSBwYXJhbXNcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBTaG93Y2FzZShwYXJhbXMpe1xyXG4gIHZhciBjb250YWluZXIgPSBwYXJhbXMuc2hvd2Nhc2VDb250YWluZXIsXHJcbiAgICBncmlkU2l6ZSA9IHBhcnNlSW50KCAoMTIvcGFyYW1zLmdyaWRTaXplKSwxMCApIHx8IDQsXHJcbiAgICBzZWxmID0gdGhpcyxcclxuICAgIHVuaXFUYWdzID0gbmV3IFRhZ3MoKSxcclxuICAgIG5hdmJhcixcclxuICAgIGJvZHksXHJcbiAgICBjYXRlZ29yaWVzID0gW107XHJcblxyXG4gIHRoaXMuYWRkUmFuZ2UgPSBmdW5jdGlvbihsaXN0KXtcclxuICAgIGlmKHR5cGVvZiBsaXN0ID09PSBcInN0cmluZ1wiKVxyXG4gICAgICBsaXN0ID0gSlNPTi5wYXJzZShsaXN0KTtcclxuXHJcbiAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24oc3JjLGkpe1xyXG4gICAgICB1bmlxVGFncy5hZGQoc3JjLmNhdGVnb3J5TmFtZSk7XHJcbiAgICAgIGNhdGVnb3JpZXMucHVzaChcclxuICAgICAgICBuZXcgQ2F0ZWdvcnkoe1xyXG4gICAgICAgICAgY2F0ZWdvcnlDb250YWluZXI6IGNvbnRhaW5lcixcclxuICAgICAgICAgIGdyaWRTaXplOiAoIGxpc3QubGVuZ3RoIDwgZ3JpZFNpemUgJiYgc3JjLnByb2R1Y3RzLmxlbmd0aCA9PT0xICkgPyBudWxsIDogZ3JpZFNpemUsXHJcbiAgICAgICAgICBjYXRlZ29yeUlkOiBzcmMuY2F0ZWdvcnlJZCxcclxuICAgICAgICAgIGNhdGVnb3J5TmFtZTogc3JjLmNhdGVnb3J5TmFtZSxcclxuICAgICAgICAgIHByb2R1Y3RzOiAoXCJwcm9kdWN0c1wiIGluIHNyYykgPyBzcmMucHJvZHVjdHMgOiBudWxsLFxyXG4gICAgICAgICAgZ2FsbGVyeVBhdGg6IHNyYy5nYWxsZXJ5UGF0aCxcclxuICAgICAgICAgIHNldHRpbmdGaWxlOiBzcmMuY2F0ZWdvcnlTZXR0aW5nc1xyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBuYXZiYXIgPSBuZXcgTmF2YmFyQmxvY2soe1xyXG4gICAgICBjb250YWluZXI6ICQoJy5uYXZiYXJfX3ByaW1hcnknKSxcclxuICAgICAgc291cmNlOiB1bmlxVGFncy5nZXRUYWdMaXN0KCksXHJcbiAgICAgIGl0ZW1MaXN0OiBjYXRlZ29yaWVzXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cbi8qKlxyXG4gKiDQo9C90LjQutCw0LvRjNC90YvQtSDRgtC10LPQuFxyXG4gKiBAY2xhc3NcclxuICovXHJcbmZ1bmN0aW9uIFRhZ3MoKXtcclxuICB2YXIgdGFnc0xpc3QgPSBbXSxcclxuICAgIHNlbGYgPSB0aGlzO1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JLRi9C00LXQu9C40YLRjCDRg9C90LjQutCw0LvRjNC90YvQtSDRgtC10LPQuFxyXG4gICAqIEBwYXJhbSBzb3VyY2UgLSDRgdC/0LjRgdC+0Log0YLQtdCz0L7QsiDQsiDRgtC+0LLQsNGA0LVcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICB0aGlzLmV4cGxvcmUgPSBmdW5jdGlvbihzb3VyY2Upe1xyXG4gICAgaWYoIXNvdXJjZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHNvdXJjZS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0saSl7XHJcbiAgICAgIGlmKCFpc0V4aXN0ZWRJbkxpc3QodGFnc0xpc3QsaXRlbSkpXHJcbiAgICAgICAgdGFnc0xpc3QucHVzaChpdGVtKTtcclxuICAgIH0pXHJcbiAgfTtcclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCS0L7Qt9Cy0YDQsNGC0LjRgtGMINGB0L/QuNGB0L7QuiDRg9C90LjQutCw0LvRjNC90YvRhSDRgtC10LPQvtCyXHJcbiAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAqL1xyXG4gIHRoaXMuZ2V0VGFnTGlzdCA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGFnc0xpc3Q7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICog0JTQvtCx0LDQstC40YLRjCDRjdC70LXQvNC10L3RgiDQsiDQutC+0LvQu9C10LrRhtC40Y5cclxuICAgKiBAcGFyYW0geyp9IGl0ZW0gLSDRjdC70LXQvNC10L3RglxyXG4gICAqL1xyXG4gIHRoaXMuYWRkID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgIHRhZ3NMaXN0LnB1c2goaXRlbSk7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICog0KHQvtGA0YLQuNGA0L7QstCw0YLRjCDRgdC/0LjRgdC+0Log0L/RgNC+0LTRg9C60YLQvtCyINC/0L4g0LrQu9GO0YfRgyAo0YLRjdCz0YMpXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyAtINGC0Y3Qs1xyXG4gICAqL1xyXG4gIHRoaXMuc29ydEJ5VGFnID0gZnVuY3Rpb24odGFnKXtcclxuICAgIHNlbGYuZmx1c2hTb3J0KCk7XHJcbiAgICB0YWdzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0saSl7XHJcbiAgICAgIGlmKCAhaXRlbS5oYXNUYWcodGFnKSApXHJcbiAgICAgICAgaXRlbS5oaWRlKCk7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBpdGVtLnJlbW92ZUxhenlMb2FkKClcclxuICAgIH0pXHJcbiAgfTtcclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCh0LHRgNC+0YHQuNGC0Ywg0YHQvtGA0YLQuNGA0L7QstC60YMg0YHQv9C40YHQutCwINC/0YDQvtC00YPQutGC0L7QslxyXG4gICAqL1xyXG4gIHRoaXMuZmx1c2hTb3J0ID0gZnVuY3Rpb24oKXtcclxuICAgIHRhZ3NMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSxpKXtcclxuICAgICAgaXRlbS5zaG93KClcclxuICAgIH0pXHJcbiAgfTtcclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCf0YDQvtCy0LXRgNC40YLRjCDRgdGD0YnQtdGB0YLQstC+0LLQsNC90LjQtSDRjdC70LXQvNC10L3RgtCwINCyINC80LDRgdGB0LjQstC1XHJcbiAgICogQHBhcmFtIHtbXX0gaXRlbUxpc3QgLSDQvNCw0YHRgdC40LIg0Y3Qu9C10LzQtdC90YLQvtCyXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGl0ZW1OYW1lIC0g0LjRgdC60L7QvNGL0Lkg0Y3Qu9C10LzQtdC90YJcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBmdW5jdGlvbiBpc0V4aXN0ZWRJbkxpc3QoaXRlbUxpc3QsaXRlbU5hbWUpe1xyXG4gICAgcmV0dXJuIGl0ZW1MaXN0LmluZGV4T2YoaXRlbU5hbWUpICE9PSAtMTtcclxuICB9XHJcblxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gTmF2YmFyQmxvY2socGFyYW1zKXtcclxuICB2YXIgY29udGFpbmVyID0gJChwYXJhbXMuY29udGFpbmVyKSxcclxuICAgICAgaXRlbUxpc3QgPSBwYXJhbXMuaXRlbUxpc3QsXHJcbiAgICAgIHNvdXJjZSA9IHBhcmFtcy5zb3VyY2UsXHJcbiAgICAgIHNlbGVjdGVkVGFncyA9IFtdLFxyXG4gICAgICBib2R5LFxyXG4gICAgICBzZWxmID0gdGhpcyxcclxuICAgICAgc29ydEJ5VGFnID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiggJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykgKSB7XHJcbiAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgIHZhciB0aGlzVGFnID0gJCh0aGlzKS5hdHRyKCdkYXRhLXRhcmdldCcpO1xyXG4gICAgICAgICAgc2VsZWN0ZWRUYWdzLnJlbW92ZSh0aGlzVGFnKTtcclxuICAgICAgICAgIHNlbGYuc29ydEJ5VGFnTGlzdCgpO1xyXG4gICAgICAgICAgLy9zZWxmLmNsZWFyU29ydCgpO1xyXG4gICAgICAgICAgLy9mbHVzaFNlbGVjdGlvbigpO1xyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgIC8vZmx1c2hTZWxlY3Rpb24oKTtcclxuICAgICAgICAgIHNlbGVjdGVkVGFncy5wdXNoKCAkKHRoaXMpLmF0dHIoJ2RhdGEtdGFyZ2V0JykgKTtcclxuICAgICAgICAgIHNlbGYuc29ydEJ5VGFnKCAkKHRoaXMpLmF0dHIoJ2RhdGEtdGFyZ2V0JykgKTtcclxuICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBmbHVzaEFsbCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgc2VsZi5jbGVhclNvcnQoKTtcclxuICAgICAgICBmbHVzaFNlbGVjdGlvbigpO1xyXG4gICAgICAgIHNlbGVjdGVkVGFncyA9IFtdO1xyXG4gICAgICB9O1xyXG5cclxuICAvKipcclxuICAgKiDQntGC0YDQuNGB0L7QstCw0YLRjCDRjdC70LXQvNC10L3RglxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgIHZhciBmaXJzdENvbCAgPSBjb2x1bW4oJ25hdi10YWdzX19jb2x1bW4gY29sLTYgY29sLXNtJyk7XHJcbiAgICB2YXIgc2Vjb25kQ29sID0gY29sdW1uKCduYXYtdGFnc19fY29sdW1uIGNvbC02IGNvbC1zbScpO1xyXG4gICAgdmFyIHRoaXJkQ29sICA9IGNvbHVtbignbmF2LXRhZ3NfX2NvbHVtbiBjb2wtMTIgY29sLXNtJyk7XHJcbiAgICB2YXIgZm91cnRoQ29sID0gY29sdW1uKCduYXYtdGFnc19fY29sdW1uIGNvbC02IGNvbC1zbScpO1xyXG4gICAgdmFyIGZpZnRoQ29sICA9IGNvbHVtbignbmF2LXRhZ3NfX2NvbHVtbiBjb2wtNiBjb2wtc20nKTtcclxuICAgIHZhciBpdHIgPSAxO1xyXG4gICAgc291cmNlLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgaWYoIGl0ciA9PT0gMSApIGZpcnN0Q29sLmFwcGVuZCggdGFnQnV0dG9uKGl0ZW0pICk7XHJcbiAgICAgIGlmKCBpdHIgPT09IDIgKSBzZWNvbmRDb2wuYXBwZW5kKCB0YWdCdXR0b24oaXRlbSkgKTtcclxuICAgICAgaWYoIGl0ciA9PT0gMyApIGZvdXJ0aENvbC5hcHBlbmQoIHRhZ0J1dHRvbihpdGVtKSApO1xyXG4gICAgICBpZiggaXRyID09PSA0ICkgZmlmdGhDb2wuYXBwZW5kKCB0YWdCdXR0b24oaXRlbSkgKTtcclxuXHJcbiAgICAgIGlmKGl0ciA9PT0gNCApIGl0ciA9IDE7XHJcbiAgICAgIGVsc2UgaXRyICsrXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlyZENvbC5hcHBlbmQoIGZsdXNoQnV0dG9uKCfQktGB0LUnKSk7XHJcblxyXG4gICAgYm9keSA9ICQoJzxkaXYvPicse2lkOlwidGFnbGlzdF9fcHJpbWFyeVwiLGNsYXNzOidyb3cgdy0xMDAnfSlcclxuICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgIGZpcnN0Q29sLFxyXG4gICAgICAgICAgICBzZWNvbmRDb2wsXHJcbiAgICAgICAgICAgIHRoaXJkQ29sLFxyXG4gICAgICAgICAgICBmb3VydGhDb2wsXHJcbiAgICAgICAgICAgIGZpZnRoQ29sXHJcbiAgICAgICAgICApO1xyXG5cclxuICAgIGJvZHkuYXBwZW5kVG8oY29udGFpbmVyKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY29sdW1uKGNsYXNzTmFtZSl7XHJcbiAgICByZXR1cm4gJCgnPGRpdi8+Jyx7XHJcbiAgICAgIHN0eWxlOidmbGV4LXdyYXA6d3JhcCcsXHJcbiAgICAgIGNsYXNzOidkLWZsZXggZmxleC1yb3cgZC1zbS1ibG9jayBwLTAgJyArIGNsYXNzTmFtZX0pXHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gdGFnQnV0dG9uKHRhcmdldCl7XHJcbiAgICByZXR1cm4gJCgnPGEvPicse1xyXG4gICAgICBjbGFzczogJ2J0biBidG4tbGluayBuYXYtdGFnc19faXRlbSBwLTAnLFxyXG4gICAgICBocmVmOiAnIycsXHJcbiAgICAgICdkYXRhLXRhcmdldCc6IHRhcmdldCxcclxuICAgICAgdGV4dDogdGFyZ2V0LFxyXG4gICAgICBjbGljazogc29ydEJ5VGFnXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmx1c2hCdXR0b24odGV4dCl7XHJcbiAgICByZXR1cm4gJCgnPGEvPicse1xyXG4gICAgICBjbGFzczogJ2J0biBidG4tbGluayBuYXYtdGFnc19faXRlbSBuYXYtdGFnc19faXRlbV9wcmltYXJ5JyxcclxuICAgICAgaHJlZjogJyMnLFxyXG4gICAgICAnZGF0YS10YXJnZXQnOiAnZmx1c2gnLFxyXG4gICAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgICBjbGljazogZmx1c2hBbGxcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0KHQsdC+0YDRgdC40YLRjCDQstGL0LTQtdC70LXQvdC40LUg0YEg0LDQutGC0LjQstC90YvRhSDRgtC10LPQvtCyXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZmx1c2hTZWxlY3Rpb24oKXtcclxuICAgICQoJy5uYXYtdGFnc19faXRlbS5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0KHQvtGA0YLQuNGA0L7QstC60LAg0L/QviDRgtGN0LPRg1xyXG4gICAqINCh0LrRgNGL0YLRjCDQstGB0LUg0YLQvtCy0LDRgNGLINCx0LXQtyDQt9Cw0LTQsNC90L3QvtCz0L4g0YLQtdCz0LBcclxuICAgKiBAcGFyYW0gdGFnXHJcbiAgICovXHJcbiAgdGhpcy5zb3J0QnlUYWcgPSBmdW5jdGlvbih0YWcpe1xyXG4gICAgLy9zZWxmLmNsZWFyU29ydCgpO1xyXG4gICAgdmFyIGNvdW50T2ZJdGVtc1dpdGhUYWcgPSAwO1xyXG4gICAgaXRlbUxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtLGkpe1xyXG4gICAgICBpZiggIWl0ZW0uaGFzVGFnKHRhZykgKVxyXG4gICAgICAgIGl0ZW0uaGlkZSgpO1xyXG4gICAgICBlbHNlIGlmKCAhaXRlbS5pc0hpZGRlbigpICl7XHJcbiAgICAgICAgY291bnRPZkl0ZW1zV2l0aFRhZyArKztcclxuICAgICAgICBpdGVtLnJlbW92ZUxhenlMb2FkKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgaWYoIGNvdW50T2ZJdGVtc1dpdGhUYWcgPT09IDAgKXtcclxuICAgICAgJCgnLm51bGwtcmVzdWx0JykucmVtb3ZlKCk7XHJcbiAgICAgICQoJzxoMi8+Jyx7Y2xhc3M6J251bGwtcmVzdWx0IHRleHQtY2VudGVyIHAtNSB3LTEwMCcsc3R5bGU6J2JvcmRlcjogMXB4IGRhc2hlZCAnICtjb21tb24ucHJpbWFyeUNvbG9yLHRleHQ6J9Cf0L4g0LrQvtC80LHQuNC90LDRhtC40Lgg0YLQtdCz0L7QsiBcIicgKyBzZWxlY3RlZFRhZ3Muam9pbignICsgJykgKyAnXCIg0L3QtdGCINGB0L7QstC/0LDQtNC10L3QuNC5J30pXHJcbiAgICAgICAgLmFwcGVuZFRvKCcudm5sX19nYWxsZXJ5LC52bmxfX3Nob3djYXNlJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQoJy5udWxsLXJlc3VsdCcpLnJlbW92ZSgpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCh0L7RgNGC0LjRgNC+0LLQutCwINC/0L4g0YHQv9C40YHQutGDINGC0LXQs9C+0LJcclxuICAgKi9cclxuICB0aGlzLnNvcnRCeVRhZ0xpc3QgPSBmdW5jdGlvbigpe1xyXG4gICAgc2VsZi5jbGVhclNvcnQoKTtcclxuICAgIHNlbGVjdGVkVGFncy5mb3JFYWNoKGZ1bmN0aW9uKHRhZyl7XHJcbiAgICAgIHNlbGYuc29ydEJ5VGFnKHRhZylcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQntGH0LjRgdGC0LjRgtGMINGB0L7RgNGC0LjRgNC+0LLQutGDXHJcbiAgICovXHJcbiAgdGhpcy5jbGVhclNvcnQgPSBmdW5jdGlvbigpe1xyXG4gICAgaXRlbUxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtLGkpe1xyXG4gICAgICBpdGVtLnNob3coKVxyXG4gICAgfSlcclxuICB9O1xyXG5cclxuICAoZnVuY3Rpb24gKCkge1xyXG4gICAgcmVuZGVyKClcclxuICB9KSgpXHJcbn1cclxuXG4vKipcclxuICog0JrQvtC80L/QvtC90LXQvdGCINC00LvRjyDQvtGC0L7QsdGA0LDQttC10L3QuNGPINGB0L/QuNGB0LrQsCDQtNC+0L/QvtC70L3QtdC90LjQuSDQuiDQvdCw0YfQuNC90LrQtSDQtNC70Y8g0L/RgNC+0LTRg9C60YLQsCDQsiDQt9Cw0Y/QstC60LVcclxuICogQHBhcmFtcyB7b2JqZWN0fSBwYXJhbXNcclxuICogQHBhcmFtIHtvYmplY3R9ICBwYXJhbXMuY29udGFpbmVyICAtINC60L7QvdGC0LXQudC90LXRgCDQtNC70Y8g0LLRgdGC0LDQstC60Lgg0LrQvtC80L/QvtC90LXQvdGC0LBcclxuICogQHBhcmFtIHtudW1iZXJ9ICBwYXJhbXMucHJvZHVjdElkICAtINCY0JQg0L/RgNC+0LTRg9C60YLQsFxyXG4gKiBAcGFyYW0ge1tdfSAgICAgIHBhcmFtcy5hZGRpdGlvbmFsU3R1ZmZpbmdMaXN0IC0g0YHQv9C40YHQvtC6INC00L7Qv9C+0LvQvdC10L3QuNC5INC6INC90LDRh9C40L3QutC1XHJcbiAqIEBhdXRob3Igc2tpcHBlclRlYW1cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBDb21wb25lbnRBZGRpdGlvbmFsU3R1ZmZpbmcocGFyYW1zKSB7XHJcbiAgdmFyIGNvbnRhaW5lciAgICAgICAgICAgPSBwYXJhbXMuY29udGFpbmVyLFxyXG4gICAgcHJvZHVjdElkICAgICAgICAgICAgID0gcGFyYW1zLnByb2R1Y3RJZCxcclxuICAgIGFkZGl0aW9uYWxTdHVmZmluZ0xpc3Q9IHBhcmFtcy5hZGRpdGlvbmFsU3R1ZmZpbmdMaXN0LFxyXG4gICAgJGJvZHkgICAgICAgPSAnJyxcclxuICAgIGNvdW50ZXIgICAgID0gMTtcclxuXHJcbiAgLyoqXHJcbiAgICog0KHQvtC30LTQsNGC0Ywg0Y3Qu9C10LzQtdC90YIg0LLRi9Cx0L7RgNCwINC00L7Qv9C+0LvQvdC10L3QuNGPINC6INC90LDRh9C40L3QutC1XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSDQvdCw0LfQstCw0L3QuNC1INGN0LvQtdC80LXQvdGC0LBcclxuICAgKiBAcmV0dXJucyB7Knx2b2lkfGpRdWVyeX1cclxuICAgKi9cclxuICBmdW5jdGlvbiBjcmVhdGVTdHVmZmluZ0l0ZW0obmFtZSkge1xyXG4gICAgcmV0dXJuICQoJzxkaXYvPicse2NsYXNzOlwiY3VzdG9tLWNvbnRyb2wgY3VzdG9tLWNoZWNrYm94XCJ9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgICQoJzxpbnB1dC8+Jyx7XHJcbiAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgICAgY2xhc3M6ICdjdXN0b20tY29udHJvbC1pbnB1dCcsXHJcbiAgICAgICAgICBpZDogJ2NoZWNrYm94LWFkcy0nK3Byb2R1Y3RJZCsnJytjb3VudGVyLFxyXG4gICAgICAgICAgdmFsdWU6IG5hbWVcclxuICAgICAgICB9KSxcclxuICAgICAgICAkKCc8bGFiZWwvPicse1xyXG4gICAgICAgICAgY2xhc3M6ICdjdXN0b20tY29udHJvbC1sYWJlbCcsXHJcbiAgICAgICAgICBmb3I6ICdjaGVja2JveC1hZHMtJytwcm9kdWN0SWQrJycrY291bnRlciArKyxcclxuICAgICAgICAgIHRleHQ6IG5hbWVcclxuICAgICAgICB9KVxyXG4gICAgICApXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0J7RgtGA0LjRgdC+0LLQsNGC0Ywg0LrQvtC80L/QvtC90LXQvdGCXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcmVuZGVyKCl7XHJcbiAgICAkYm9keSA9ICQoJzxkaXYvPicse2NsYXNzOidwcm9kdWN0LXJldmlld19fYWRkaXRpb25hbFN0dWZmaW5nLWNvbnRhaW5lcid9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgICQoJzxzcGFuLz4nLHt0ZXh0OiAn0KPQutCw0LbQuNGC0LUg0LTQvtC/0L7Qu9C90LXQvdC40Y8g0Log0L3QsNGH0LjQvdC60LUnfSksXHJcbiAgICAgICAgJCgnPGhyPicpXHJcbiAgICAgICk7XHJcbiAgICBhZGRpdGlvbmFsU3R1ZmZpbmdMaXN0LmZvckVhY2goZnVuY3Rpb24oc3R1ZmYsaSl7XHJcbiAgICAgICRib2R5LmFwcGVuZCggY3JlYXRlU3R1ZmZpbmdJdGVtKHN0dWZmLm5hbWUpIClcclxuICAgIH0pO1xyXG4gICAgJGJvZHkuYXBwZW5kVG8oY29udGFpbmVyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqINCS0L7Qt9Cy0YDQsNGC0LjRgtGMINCy0YvQtNC10LvQtdC90L3Ri9C1INC00LDQvdC90YvQtVxyXG4gICAqIEByZXR1cm5zIHtbXX1cclxuICAgKi9cclxuICB0aGlzLmdldERhdGEgPSBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGFkZGl0aW9uYWxTdHVmZmluZ0xpc3QgPSBbXTtcclxuICAgICRib2R5LmZpbmQoJzpjaGVja2JveDpjaGVja2VkJykuZWFjaChmdW5jdGlvbihpLHN0dWZmKXtcclxuICAgICAgYWRkaXRpb25hbFN0dWZmaW5nTGlzdC5wdXNoKFxyXG4gICAgICAgICQoc3R1ZmYpLmF0dHIoJ3ZhbHVlJylcclxuICAgICAgKVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gYWRkaXRpb25hbFN0dWZmaW5nTGlzdDtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiDQo9GB0YLQsNC90L7QstC40YLRjCDQtNCw0L3QvdGL0LVcclxuICAgKiBAcGFyYW0ge1tdfSB2YWx1ZXNcclxuICAgKi9cclxuICB0aGlzLnNldERhdGEgPSBmdW5jdGlvbiAodmFsdWVzKSB7XHJcbiAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgICQoJy5jdXN0b20tY29udHJvbC1pbnB1dCcpLmZpbmQoJ1t2YWx1ZT0nK3ZhbHVlKyddJylcclxuICAgICAgICAuYXR0cignY2hlY2tlZCcsJ2NoZWNrZWQnKVxyXG4gICAgfSlcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiDQpNGD0L3QutGG0LjRjyDQutC+0L3RgdGC0YDRg9C60YLQvtGAXHJcbiAgICovXHJcbiAgKGZ1bmN0aW9uKCl7XHJcbiAgICByZW5kZXIoKTtcclxuICB9KSgpXHJcbn1cbi8qKlxyXG4gKiDQmtC+0LzQv9C+0L3QtdC90YIg0LTQu9GPINC+0YLQvtCx0YDQsNC20LXQvdC40Y8g0YHQv9C40YHQutCwINC00LXQutC+0YDQvtCyKNC+0YTQvtGA0LzQu9C10L3QuNC5KSDQtNC70Y8g0L/RgNC+0LTRg9C60YLQsCDQsiDQt9Cw0Y/QstC60LVcclxuICogQHBhcmFtcyB7b2JqZWN0fSBwYXJhbXNcclxuICogQHBhcmFtIHtvYmplY3R9ICBwYXJhbXMuY29udGFpbmVyXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSAgcGFyYW1zLnByb2R1Y3RJZFxyXG4gKiBAcGFyYW0ge1tdfSAgICAgIHBhcmFtcy5kZWNvckxpc3RcclxuICogQHBhcmFtIHtzdHJpbmd9ICBwYXJhbXMuY2FwdGlvblxyXG4gKiBAYXV0aG9yIHNraXBwZXJUZWFtXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gQ29tcG9uZW50RGVjb3IocGFyYW1zKSB7XHJcbiAgdmFyIGNvbnRhaW5lciA9IHBhcmFtcy5jb250YWluZXIsXHJcbiAgICBwcm9kdWN0SWQgICA9IHBhcmFtcy5wcm9kdWN0SWQsXHJcbiAgICBkZWNvckxpc3QgICA9IHBhcmFtcy5kZWNvckxpc3QsXHJcbiAgICBjYXB0aW9uICAgICA9IHBhcmFtcy5jYXB0aW9uLFxyXG4gICAgJGJvZHkgICAgICAgPSAnJyxcclxuICAgIGNvdW50ZXIgICAgID0gMTtcclxuXHJcbiAgLyoqXHJcbiAgICog0KHQvtC30LTQsNGC0Ywg0Y3Qu9C10LzQtdC90YIg0LLRi9Cx0L7RgNCwINC+0YTQvtGA0LzQu9C10L3QuNGPXHJcbiAgICogQHBhcmFtIG5hbWVcclxuICAgKiBAcmV0dXJucyB7Knx2b2lkfGpRdWVyeX1cclxuICAgKi9cclxuICBmdW5jdGlvbiBjcmVhdGVEZWNvckl0ZW0obmFtZSkge1xyXG4gICAgcmV0dXJuICQoJzxkaXYvPicse2NsYXNzOlwiY3VzdG9tLWNvbnRyb2wgY3VzdG9tLWNoZWNrYm94XCJ9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgICQoJzxpbnB1dC8+Jyx7XHJcbiAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxyXG4gICAgICAgICAgY2xhc3M6ICdjdXN0b20tY29udHJvbC1pbnB1dCcsXHJcbiAgICAgICAgICBpZDogJ2NoZWNrYm94LWRjci0nK3Byb2R1Y3RJZCsnJytjb3VudGVyLFxyXG4gICAgICAgICAgdmFsdWU6IG5hbWVcclxuICAgICAgICB9KSxcclxuICAgICAgICAkKCc8bGFiZWwvPicse1xyXG4gICAgICAgICAgY2xhc3M6ICdjdXN0b20tY29udHJvbC1sYWJlbCcsXHJcbiAgICAgICAgICBmb3I6ICdjaGVja2JveC1kY3ItJytwcm9kdWN0SWQrJycrY291bnRlcisrLFxyXG4gICAgICAgICAgdGV4dDogbmFtZVxyXG4gICAgICAgIH0pXHJcbiAgICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqINCe0YLRgNC40YHQvtCy0LDRgtGMINC60L7QvdGC0LXQudC90LXRgFxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHJlbmRlcigpe1xyXG4gICAgdmFyIGRlY29yQ2FwdGlvbiA9IGNhcHRpb24gPyBjYXB0aW9uIDogJ9CS0YvQsdC10YDQuNGC0LUg0LLQsNGA0LjQsNC90YIg0L7RhNC+0YDQvNC70LXQvdC40Y8nO1xyXG4gICAgJGJvZHkgPSAkKCc8ZGl2Lz4nLHtjbGFzczoncHJvZHVjdC1yZXZpZXdfX2RlY29yLWNvbnRhaW5lcid9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgICQoJzxzcGFuLz4nLHt0ZXh0OiBkZWNvckNhcHRpb259KSxcclxuICAgICAgICAkKCc8aHI+JylcclxuICAgICAgKTtcclxuICAgIGRlY29yTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGRlY29yKXtcclxuICAgICAgJGJvZHkuYXBwZW5kKCBjcmVhdGVEZWNvckl0ZW0oZGVjb3IubmFtZSkgKVxyXG4gICAgfSk7XHJcbiAgICAkYm9keS5hcHBlbmRUbyhjb250YWluZXIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICog0JLQvtC30LLRgNCw0YLQuNGC0Ywg0YHQv9C40YHQvtC6INCy0YvQsdGA0LDQvdC90YvRhSDRjdC70LXQvNC10L3RgtC+0LIg0L7RhNC+0YDQvNC70LXQvdC40Y9cclxuICAgKiBAcmV0dXJucyB7W119XHJcbiAgICovXHJcbiAgdGhpcy5nZXREYXRhID0gZnVuY3Rpb24oKXtcclxuICAgIHZhciBkZWNvckxpc3QgPSBbXTtcclxuICAgICRib2R5LmZpbmQoJzpjaGVja2JveDpjaGVja2VkJykuZWFjaChmdW5jdGlvbihpLGRlY29yKXtcclxuICAgICAgZGVjb3JMaXN0LnB1c2goICQoZGVjb3IpLmF0dHIoJ3ZhbHVlJykgKVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZGVjb3JMaXN0O1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqINCj0YHRgtCw0L3QvtCy0LjRgtGMINC00LDQvdC90YvQtVxyXG4gICAqIEBwYXJhbSB7W119IHZhbHVlc1xyXG4gICAqL1xyXG4gIHRoaXMuc2V0RGF0YSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcclxuICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICAgJCgnLmN1c3RvbS1jb250cm9sLWlucHV0JykuZmluZCgnW3ZhbHVlPScrdmFsdWUrJ10nKVxyXG4gICAgICAgIC5hdHRyKCdjaGVja2VkJywnY2hlY2tlZCcpXHJcbiAgICB9KVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqINCk0YPQvdC60YbQuNGPINC60L7QvdGB0YLRgNGD0LrRgtC+0YBcclxuICAgKi9cclxuICAoZnVuY3Rpb24oKXtcclxuICAgIHJlbmRlcigpO1xyXG4gIH0pKClcclxufVxuLyoqXHJcbiAqINCa0L7QvNC/0L7QvdC10L3RgiDQtNC70Y8g0LLRgdGC0LDQstC60Lh80LfQsNCz0YDRg9C30LrQuCDQuNC30L7QsdGA0LDQttC10L3QuNC5XHJcbiAqIEBwYXJhbSBwYXJhbXNcclxuICogQHBhcmFtcyB7b2JqZWN0fSBwYXJhbXNcclxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJhbXMuY29udGFpbmVyICAtINC60L7QvdGC0LXQudC90LXRgCDQtNC70Y8g0YDQsNC30LzQtdGJ0LXQvdC40Y8g0Y3Qu9C10LzQtdC90YLQsFxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHBhcmFtcy5wcm9kdWN0SWQgIC0g0JjQlCDQv9GA0L7QtNGD0LrRgtCwXHJcbiAqIEBhdXRob3Igc2tpcHBlclRlYW1cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBDb21wb25lbnRJbWFnZShwYXJhbXMpe1xyXG4gIHZhciBjb250YWluZXIgPSBwYXJhbXMuY29udGFpbmVyLFxyXG4gICAgcHJvZHVjdElkICAgPSBwYXJhbXMucHJvZHVjdElkLFxyXG4gICAgJGJvZHkgICAgICAgPSAnJyxcclxuICAgIGNvdW50ZXIgICAgID0gMDtcclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlSW1hZ2VJdGVtKCl7XHJcbiAgICBjb3VudGVyICsrO1xyXG4gICAgcmV0dXJuICQoJzxkaXYvPicse2NsYXNzOid2bmwtY2FyZF9fd3JhcHBlciBwLTMgY29sLXNtLTQgYW5pbWF0ZSBib3VuY2VJblVwJ30pXHJcbiAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6J2NhcmQgYm9yZGVyLXN1Y2Nlc3MgcHJvZHVjdC1yZXZpZXdfX2ltYWdlLXVwbG9hZCAnfSlcclxuICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICQoJzxzcGFuLz4nLHt0ZXh0OifQktCw0YjQtSDQuNC30L7QsdGA0LDQttC10L3QuNC1JyxjbGFzczonYm9yZGVyLWJvdHRvbSB0ZXh0LWNlbnRlcid9KSxcclxuICAgICAgICAgICAgJCgnPGltZy8+Jyx7XHJcbiAgICAgICAgICAgICAgY2xhc3M6J2NhcmQtaW1nLXRvcCBiZy1saWdodCBib3JkZXItYm90dG9tJyxcclxuICAgICAgICAgICAgICBzdHlsZTonaGVpZ2h0OiAxODBweDtvYmplY3QtZml0OmNvbnRhaW47Y29sb3I6ICNmOGY5ZmE7JyxcclxuICAgICAgICAgICAgICBhbHQ6ICd1cGxvYWQtaW1hZ2UnLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6J2NhcmQtYm9keSBwYi0zJ30pXHJcbiAgICAgICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgICAgIC8vVE9ETyBwcm92aWRlIGNvbW1lbnRhcmllcyBmb3IgaW1hZ2VcclxuICAgICAgICAgICAgICAgIC8vJCgnPGg1Lz4nLHtjbGFzczogJ2NhcmQtdGl0bGUnLHRleHQ6J9CS0LLQtdC00LjRgtC1INC+0L/QuNGB0LDQvdC40LUnfSksXHJcbiAgICAgICAgICAgICAgICAvLyQoJzx0ZXh0YXJlYS8+Jyx7Y2xhc3M6ICdjYXJkLXRleHQgdy0xMDAnLHJvd3M6NX0pLFxyXG4gICAgICAgICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6J2NhcmQtdXBsb2FkLXR5cGUnfSlcclxuICAgICAgICAgICAgICAgICAgLmFwcGVuZChcclxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVDb21wb25lbnRVcGxvYWRUeXBlKClcclxuICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgIClcclxuICAgICAgKVxyXG4gIH1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudFVwbG9hZFR5cGUoKXtcclxuICAgIHJldHVybiAkKCc8ZGl2Lz4nLHtjbGFzczonaW1hZ2UtY29udGFpbmVyX19jb250cm9scyBteS0zJ30pXHJcbiAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6XCJjdXN0b20tY29udHJvbCBjdXN0b20tcmFkaW9cIn0pXHJcbiAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAkKCc8aW5wdXQvPicse1xyXG4gICAgICAgICAgICAgIGNoZWNrZWQ6ICdjaGVja2VkJyxcclxuICAgICAgICAgICAgICB0eXBlOiAncmFkaW8nLFxyXG4gICAgICAgICAgICAgIGlkOiAnY29udHJvbC1yYWRpbycrY291bnRlcisnX18nK2NvdW50ZXIsXHJcbiAgICAgICAgICAgICAgY2xhc3M6ICdjdXN0b20tY29udHJvbC1pbnB1dCcsXHJcbiAgICAgICAgICAgICAgbmFtZTogJ2NvbnRyb2wtcmFkaW8nK2NvdW50ZXIrJ19fJytjb3VudGVyLFxyXG4gICAgICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuaW1hZ2UtY29udGFpbmVyX19jb250cm9scycpLmZpbmQoJy5yZWYtdXBsb2FkJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuaW1hZ2UtY29udGFpbmVyX19jb250cm9scycpLmZpbmQoJy5pbWctdXBsb2FkJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICQoJzxsYWJlbC8+Jyx7XHJcbiAgICAgICAgICAgICAgY2xhc3M6ICdjdXN0b20tY29udHJvbC1sYWJlbCcsXHJcbiAgICAgICAgICAgICAgZm9yOiAnY29udHJvbC1yYWRpbycrY291bnRlcisnX18nK2NvdW50ZXIsXHJcbiAgICAgICAgICAgICAgdGV4dDogJ9CX0LDQs9GA0YPQt9C40YLRjCDQuNC30L7QsdGA0LDQttC10L3QuNC1INC/0L4g0YHRgdGL0LvQutC1J1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgKSxcclxuICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczpcImN1c3RvbS1jb250cm9sIGN1c3RvbS1yYWRpb1wifSlcclxuICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICQoJzxpbnB1dC8+Jyx7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ3JhZGlvJyxcclxuICAgICAgICAgICAgICBpZDogJ2NvbnRyb2wtcmFkaW8yJytjb3VudGVyKydfXycrY291bnRlcixcclxuICAgICAgICAgICAgICBjbGFzczogJ2N1c3RvbS1jb250cm9sLWlucHV0JyxcclxuICAgICAgICAgICAgICBuYW1lOiAnY29udHJvbC1yYWRpbycrY291bnRlcisnX18nK2NvdW50ZXIsXHJcbiAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5pbWFnZS1jb250YWluZXJfX2NvbnRyb2xzJykuZmluZCgnLmltZy11cGxvYWQnKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5pbWFnZS1jb250YWluZXJfX2NvbnRyb2xzJykuZmluZCgnLnJlZi11cGxvYWQnKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgJCgnPGxhYmVsLz4nLHtcclxuICAgICAgICAgICAgICBjbGFzczogJ2N1c3RvbS1jb250cm9sLWxhYmVsJyxcclxuICAgICAgICAgICAgICBmb3I6ICdjb250cm9sLXJhZGlvMicrY291bnRlcisnX18nK2NvdW50ZXIsXHJcbiAgICAgICAgICAgICAgdGV4dDogJ9CX0LDQs9GA0YPQt9C40YLRjCDQuNC30L7QsdGA0LDQttC10L3QuNC1INGBINC00LjRgdC60LAnXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgICQoJzxkaXYvPicpXHJcbiAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAkKCc8aW5wdXQvPicse1xyXG4gICAgICAgICAgICAgIGNsYXNzOidmb3JtLWNvbnRyb2wgdy0xMDAgcmVmLXVwbG9hZCcsXHJcbiAgICAgICAgICAgICAgaWQ6J2xvYWQtbGlua19fJytjb3VudGVyLCAvL2V4YW1wbGUgaHR0cDovL2FwaS5qcXVlcnkuY29tL2pxdWVyeS13cC1jb250ZW50L3RoZW1lcy9qcXVlcnkvY29udGVudC9kb25hdGUucG5nXHJcbiAgICAgICAgICAgICAgdHlwZTondGV4dCcsXHJcbiAgICAgICAgICAgICAgY2hhbmdlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuY2FyZCcpLmZpbmQoJy5jYXJkLWltZy10b3AnKS5hdHRyKCdzcmMnLCAkKHRoaXMpLnZhbCgpICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgJCgnPGlucHV0Lz4nLHtcclxuICAgICAgICAgICAgICBjbGFzczonZm9ybS1jb250cm9sIHctMTAwIGltZy11cGxvYWQgYm9yZGVyLTAnLFxyXG4gICAgICAgICAgICAgIGlkOidsb2FkLWltYWdlX18nK2NvdW50ZXIsXHJcbiAgICAgICAgICAgICAgdHlwZTonZmlsZScsXHJcbiAgICAgICAgICAgICAgY2hhbmdlOiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICBsZXQgdGhhdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICBmaWxlcyA9IGV2dC50YXJnZXQuZmlsZXM7XHJcbiAgICAgICAgICAgICAgICAgIGlmICghZmlsZXNbMF0udHlwZS5tYXRjaCgnaW1hZ2UuKicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdmaWxlIHR5cGUgaXMgbm90IGFuIGltYWdlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgbGV0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24gKHRoZUZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICQodGhhdCkuY2xvc2VzdCgnLmNhcmQnKS5maW5kKCcuY2FyZC1pbWctdG9wJykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICB9KShmaWxlc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVzWzBdKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgeyBjb25zb2xlLndhcm4oZXJyKSB9XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBhY2NlcHQ6XCJpbWFnZS8qLGltYWdlL2pwZWdcIn0pXHJcbiAgICAgICAgICApXHJcbiAgICAgIClcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiDQntGC0YDQuNGB0L7QstCw0YLRjCDQutC+0LzQv9C+0L3QtdC90YJcclxuICAgKi9cclxuICBmdW5jdGlvbiByZW5kZXIoKXtcclxuXHJcbiAgICAkYm9keSA9ICQoJzxkaXYvPicse2NsYXNzOiAncm93IGQtZmxleCBmbGV4LXJvdy1yZXZlcnNlIHByb2R1Y3QtcmV2aWV3X19pbWFnZXMtY29udGFpbmVyIG10LTMnfSlcclxuICAgICAgLmFwcGVuZChcclxuICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczonY29sLTEyIGltYWdlLWNvbnRhaW5lcl9fcHJldmlldyB0ZXh0LWNlbnRlciBwYi0zIGJvcmRlci1ib3R0b20nfSlcclxuICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICQoJzxpbnB1dC8+Jyx7XHJcbiAgICAgICAgICAgICAgY2xhc3M6J2J0biBidG4tb3V0bGluZS1pbmZvIG14LWF1dG8nLFxyXG4gICAgICAgICAgICAgIHR5cGUgOididXR0b24nLFxyXG4gICAgICAgICAgICAgIHZhbHVlOlwi0JTQvtCx0LDQstC40YLRjCDQsdC+0LvRjNGI0LUg0LjQt9C+0LHRgNCw0LbQtdC90LjQuVwiLFxyXG4gICAgICAgICAgICAgIGNsaWNrOmZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5wcm9kdWN0LXJldmlld19faW1hZ2VzLWNvbnRhaW5lcicpLmFwcGVuZChcclxuICAgICAgICAgICAgICAgICAgY3JlYXRlSW1hZ2VJdGVtKClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAkYm9keS5maW5kKCcuaW1nLXVwbG9hZDpsYXN0JykuaGlkZSgpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgKSxcclxuICAgICAgICBjcmVhdGVJbWFnZUl0ZW0oKVxyXG4gICAgICApO1xyXG5cclxuICAgICRib2R5LmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcbiAgICAkYm9keS5maW5kKCcuaW1nLXVwbG9hZCcpLmhpZGUoKVxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCS0L7Qt9Cy0YDQsNGC0LjRgtGMINGB0YLRgNC+0LrRgyDRgSDQuNC30L7QsdGA0LDQttC10L3QuNC10Lwg0LIg0YTQvtGA0LzQsNGC0LUgZGF0YTppbWFnZS9wbmc7YmFzZTY0XHJcbiAgICog0JLRgdGPINC80LDQs9C40Y8g0L/RgNC+0LjRgdGF0L7QtNC40YIg0LfQsCDRgdGH0ZHRgiDRjdC70LXQvNC10L3RgtCwIDxjYW52YXMvPiDQsiDQutC+0YLQvtGA0YvQuSDQvNGLINC30LDQs9GA0YPQttCw0LXQvFxyXG4gICAqINC40LfQvtCx0YDQsNC20LXQvdC40LVcclxuICAgKiDQldGB0LvQuCDQuNC30L7QsdGA0LDQttC10L3QuNC1INC/0L4g0LrQsNC60LjQvC3RgtC+INC/0YDQuNGH0LjQvdCw0Lwg0L3QtSDRg9C00LDQu9C+0YHRjCDQvtCx0YDQsNCx0L7RgtCw0YLRjFxyXG4gICAqICjRh9Cw0YnQtSDQstGB0LXQs9C+INC40Lct0LfQsCDQv9C+0LvQuNGC0LjQutC4INCx0LXQt9C+0L/QsNGB0L3QvtGB0YLQuCDRgtGA0LXQsdGD0Y7RidC10Lkg0YDQsNC30YDQtdGI0LXQvdC40Y8g0LrRgNC+0YHRgdC00L7QvNC10L3QvdC+0LPQviDQt9Cw0L/RgNC+0YHQsClcclxuICAgKiDRgtC+INCy0L7Qt9Cy0YDQsNGC0LjRgtGMINGB0YHRi9C70LrRgyDQvdCwINC40LfQvtCx0YDQsNC20LXQvdC40LVcclxuICAgKiAhISHQstC+0LfQvNC+0LbQvdGL0Lkg0LLQsNGA0LjQsNC90YIg0YDQtdGI0LXQvdC40Y8g0LTQsNC90L3QvtC5INC/0YDQvtCx0LvQtdC80Ysg0Y3RgtC+INGB0L7Qt9C00LDQvdC40LUg0YHQvtCx0YHRgtCy0LXQvdC90L7Qs9C+INGB0LXRgNCy0LXRgNCwXHJcbiAgICogQHBhcmFtIHtvYmplY3R8c3RyaW5nfSBpdGVtIC0g0LjQt9C+0LHRgNCw0LbQtdC90LjQtVxyXG4gICAqIEByZXR1cm4ge3N0cmluZ31cclxuICAgKi9cclxuICBmdW5jdGlvbiBnZXRCYXNlNjRGcm9tSW1hZ2VVUkwoaXRlbSkge1xyXG4gICAgbGV0IHJlc3VsdCA9ICQoaXRlbSkuYXR0cignc3JjJyksXHJcbiAgICAgIGNhbnZhcyA9ICQoXCI8Y2FudmFzLz5cIiwge2NsYXNzOiAnIWQtbm9uZSd9KS5hcHBlbmRUbygnYm9keScpLFxyXG4gICAgICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xyXG4gICAgaW1nLnNyYyA9IHJlc3VsdDtcclxuICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgY2FudmFzLndpZHRoID0gJChpdGVtKS5vdXRlcldpZHRoKCk7XHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSAkKGl0ZW0pLm91dGVySGVpZ2h0KCk7XHJcbiAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0KDApLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjdHguZHJhd0ltYWdlKCQoaXRlbSlbMF0sIDAsIDApO1xyXG4gICAgICAgIHJlc3VsdCA9IGNhbnZhcy5nZXQoMCkudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oZXJyKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgICQoY2FudmFzKS5yZW1vdmUoKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpc1VwbG9hZEJ5TGluayhzcmMpe1xyXG4gICAgcmV0dXJuIChzcmMuaW5kZXhPZignOi8vJykgPiAtMSB8fCBzcmMuaW5kZXhPZignaW1nJykgPiAtMSk7XHJcbiAgfVxyXG5cclxuICB0aGlzLmdldERhdGEgPSBmdW5jdGlvbigpe1xyXG4gICAgbGV0IHJleiA9IFtdO1xyXG4gICAgJGJvZHkuZmluZCgnLmNhcmQtaW1nLXRvcCcpLmVhY2goZnVuY3Rpb24oaSxpdGVtKXtcclxuICAgICAgbGV0IHNyYyA9ICQoaXRlbSkuYXR0cignc3JjJykgfHwgJyc7XHJcbiAgICAgIGlmKCAhc3JjICkgcmV0dXJuO1xyXG4gICAgICBpZiggIWlzVXBsb2FkQnlMaW5rKHNyYykgKSB7XHJcbiAgICAgICAgc3JjID0gZ2V0QmFzZTY0RnJvbUltYWdlVVJMKGl0ZW0pO1xyXG4gICAgICAgIHNyYyA9IHNyYy5zcGxpdCgnLCcpO1xyXG4gICAgICAgIHNyYyA9IHNyY1sxXTtcclxuICAgICAgfVxyXG4gICAgICByZXoucHVzaChzcmMpXHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXo7XHJcbiAgfTtcclxuXHJcbiAgKGZ1bmN0aW9uKCl7XHJcbiAgICByZW5kZXIoKVxyXG4gIH0pKClcclxufVxuLyoqXHJcbiAqINCa0L7QvNC/0L7QvdC10L3RgiDQtNC70Y8g0L7RgtC+0LHRgNCw0LbQtdC90LjRjyDQutC+0LzQvNC10L3RgtCw0YDQuNC10LIg0Log0LfQsNC60LDQt9GDXHJcbiAqIEBwYXJhbXMge29iamVjdH0gcGFyYW1zXHJcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmNvbnRhaW5lciAgLSDQutC+0L3RgtC10LnQvdC10YAg0LTQu9GPINGA0LDQt9C80LXRidC10L3QuNGPINGN0LvQtdC80LXQvdGC0LBcclxuICogQHBhcmFtICB7bnVtYmVyfSBwYXJhbXMucHJvZHVjdElkICAtINCY0JQg0L/RgNC+0LTRg9C60YLQsFxyXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHBhcmFtcy50ZXh0ICAgICAgIC0g0YLQtdC60YHRgiDQtNC70Y8g0L/Qu9C10LnRgdGF0L7Qu9C00LXRgNCwINGN0LvQtdC80LXQvdGC0LBcclxuICogQHBhcmFtICB7c3RyaW5nfSBwYXJhbXMudGl0bGUgICAgICAtINC90LDQuNC80LXQvdC+0LLQsNC90LjQtSDQsdC70L7QutCwXHJcbiAqIEBhdXRob3Igc2tpcHBlclRlYW1cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBDb21wb25lbnROb3RpZmljYXRpb24ocGFyYW1zKXtcclxuICB2YXIgY29udGFpbmVyID0gcGFyYW1zLmNvbnRhaW5lcixcclxuICAgIHByb2R1Y3RJZCAgID0gcGFyYW1zLnByb2R1Y3RJZCxcclxuICAgIHRleHQgICAgICAgID0gcGFyYW1zLnRleHQsXHJcbiAgICB0aXRsZSAgICAgICA9IHBhcmFtcy50aXRsZSB8fCAn0JTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YvQtSDQv9C+0LbQtdC70LDQvdC40Y8nLFxyXG4gICAgJGJvZHkgICAgICAgPSAnJztcclxuXHJcbiAgLyoqXHJcbiAgICog0J7RgtGA0LjRgdC+0LLQsNGC0Ywg0LrQvtC80L/QvtC90LXQvdGCXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcmVuZGVyKCl7XHJcbiAgICAkYm9keSA9ICQoJzxkaXYvPicse2NsYXNzOidwcm9kdWN0LXJldmlld19fbm90aWZpY2F0aW9uLWNvbnRhaW5lcid9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgICQoJzxzcGFuLz4nLHt0ZXh0OiB0aXRsZX0pLFxyXG4gICAgICAgICQoJzxoci8+JyksXHJcbiAgICAgICAgJCgnPHRleHRhcmVhLz4nLHtcclxuICAgICAgICAgIGlkOiAnbm90aWZpY2F0aW9uLScrcHJvZHVjdElkLFxyXG4gICAgICAgICAgbmFtZTogJ25vdGlmaWNhdGlvbicsXHJcbiAgICAgICAgICBjbGFzczogJ2Zvcm0tY29udHJvbCB3LTEwMCcsXHJcbiAgICAgICAgICBwbGFjZWhvbGRlcjogdGV4dCxcclxuICAgICAgICAgIHJvd3M6IDlcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgJGJvZHkuYXBwZW5kVG8oY29udGFpbmVyKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICog0JLQvtC30LLRgNCw0YLQuNGC0Ywg0LLQstC10LTRkdC90L3Ri9C5INC60L7QvNC80LXQvdGC0LDRgNC40Lkg0Log0LfQsNC60LDQt9GDXHJcbiAgICovXHJcbiAgdGhpcy5nZXREYXRhID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiAkYm9keS5maW5kKCd0ZXh0YXJlYScpLnZhbCgpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqINCj0YHRgtCw0L3QvtCy0LjRgtGMINC60L7QvNC80LXQvdGC0LDRgNC40Lkg0Log0LfQsNC60LDQt9GDXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlINGC0LXQutGB0YIg0LrQvtC80LzQtdC90YLQsNGA0LjRj1xyXG4gICAqL1xyXG4gIHRoaXMuc2V0RGF0YSA9IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICRib2R5LmZpbmQoJ3RleHRhcmVhJykudmFsKHZhbHVlKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiDQpNGD0L3QutGG0LjRjyDQutC+0L3RgdGC0YDRg9C60YLQvtGAXHJcbiAgICovXHJcbiAgKGZ1bmN0aW9uKCl7XHJcbiAgICByZW5kZXIoKTtcclxuICB9KSgpXHJcbn1cbi8qKlxyXG4gKiDQmtC+0LzQv9C+0L3QtdC90YIgXCLRgNC10LrQvtC80LXQvdC00YPQtdC80YvQtSDRgtC+0LLQsNGA0YtcIlxyXG4gKiBD0L7Qt9C00LDQvdC40LUg0LHQu9C+0LrQsCDRgSDRh9C10YLRi9GA0YzQvNGPINGA0LDQsNC90LTQvtC80L3QviDQstGL0LHRgNCw0L3QvdGL0LzQuCDQuNC3INC80LDRgdGB0LjQstCwIHJlY29tbWVuZGVkUHJvZHVjdHMg0YLQvtCy0LDRgNCw0LzQuFxyXG4gKiBAcGFyYW1zIHtvYmplY3R9IHBhcmFtc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHBhcmFtcy5wcm9kdWN0SWQgLSDQmNCUINC/0YDQvtC00YPQutGC0LBcclxuICogQHBhcmFtICB7c3RyaW5nfSBwYXJhbXMuY2FwdGlvbiAgIC0g0J3QsNC40LzQtdC90L7QstCw0L3QuNC1INCx0LvQvtC60LBcclxuICogQHJldHVybiB7SFRNTEVsZW1lbnR9XHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gQ29tcG9uZW50UmVjb21tZW5kZWRQcm9kdWN0cyhwYXJhbXMpe1xyXG4gIHZhciBwcm9kdWN0SWQgPSBwYXJhbXMucHJvZHVjdElkLFxyXG4gICAgY2FwdGlvbiAgICAgPSBwYXJhbXMuY2FwdGlvbixcclxuICAgIGRpciAgICAgICAgID0gJ2ltZy9XaXRoX3RoaXNfcHJvZHVjdF9idXkvJyxcclxuICAgIGNvdW50ICAgICAgID0gOCxcclxuICAgIG5hbWUgICAgICAgID0gJ1dpdGhfdGhpc19wcm9kdWN0X2J1eScsXHJcbiAgICByZWNBcnJheSAgICA9IFtdLFxyXG4gICAgJGJvZHkgICAgICAgPSAnJyxcclxuICAgIHJlY29tbWVuZGVkUHJvZHVjdHMgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICB0aHVtYjogZGlyICsgbmFtZSArIDEgKyAnLmpwZycsXHJcbiAgICAgICAgbmFtZSA6ICdyZWNvbW1lbmRlZCBwcm9kdWN0JyxcclxuICAgICAgICBsaW5rIDogJ2dhbGxlcnlfX2Rlc3NlcnQuaHRtbD9nb3RvPUN1cGNha2VzMidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRodW1iOiBkaXIgKyBuYW1lICsgMiArICcuanBnJyxcclxuICAgICAgICBuYW1lIDogJ3JlY29tbWVuZGVkIHByb2R1Y3QnLFxyXG4gICAgICAgIGxpbmsgOiAnZ2FsbGVyeV9fZGVzc2VydC5odG1sP2dvdG89WmVwaHlyMydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRodW1iOiBkaXIgKyBuYW1lICsgMyArICcuanBnJyxcclxuICAgICAgICBuYW1lIDogJ3JlY29tbWVuZGVkIHByb2R1Y3QnLFxyXG4gICAgICAgIGxpbmsgOiAnZ2FsbGVyeV9fZGVzc2VydC5odG1sP2dvdG89dHlwZTgnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0aHVtYjogZGlyICsgbmFtZSArIDQgKyAnLmpwZycsXHJcbiAgICAgICAgbmFtZSA6ICdyZWNvbW1lbmRlZCBwcm9kdWN0JyxcclxuICAgICAgICBsaW5rIDogJ2dhbGxlcnlfX2Rlc3NlcnQuaHRtbD9nb3RvPXR5cGUyMydcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRodW1iOiBkaXIgKyBuYW1lICsgNSArICcuanBnJyxcclxuICAgICAgICBuYW1lIDogJ3JlY29tbWVuZGVkIHByb2R1Y3QnLFxyXG4gICAgICAgIGxpbmsgOiAnZ2FsbGVyeV9fZGVzc2VydC5odG1sP2dvdG89Y2FrZXBvcHMyJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGh1bWI6IGRpciArIG5hbWUgKyA2ICsgJy5qcGcnLFxyXG4gICAgICAgIG5hbWUgOiAncmVjb21tZW5kZWQgcHJvZHVjdCcsXHJcbiAgICAgICAgbGluayA6ICdnYWxsZXJ5X19kZXNzZXJ0Lmh0bWw/Z290bz1NYXJtYWxhZGUyJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGh1bWI6IGRpciArIG5hbWUgKyA3ICsgJy5qcGcnLFxyXG4gICAgICAgIG5hbWUgOiAncmVjb21tZW5kZWQgcHJvZHVjdCcsXHJcbiAgICAgICAgbGluayA6ICdnYWxsZXJ5X19kZXNzZXJ0Lmh0bWw/Z290bz1Gb3JfY2hpbGRyZW41J1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGh1bWI6IGRpciArIG5hbWUgKyA4ICsgJy5qcGcnLFxyXG4gICAgICAgIG5hbWUgOiAncmVjb21tZW5kZWQgcHJvZHVjdCcsXHJcbiAgICAgICAgbGluayA6ICdnYWxsZXJ5X19kZXNzZXJ0Lmh0bWw/Z290bz1aZXBoeXIxJ1xyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0KHQvtC30LTQsNGC0Ywg0LrQvtC90YLQtdC50L3QtdGAINC00LvRjyDQuNC30L7QsdGA0LDQttC10L3QuNGPXHJcbiAgICogQHBhcmFtIHNyYyAgICAgICAtINC/0YPRgtGMINC6INC40LfQvtCx0YDQsNC20LXQvdC40Y5cclxuICAgKiBAcGFyYW0gY2xhc3NOYW1lIC0g0LrQsNGB0YLQvtC80L3Ri9C5INC60LvQsNGB0YEg0LTQu9GPINC60L7QvdGC0LXQudC90LXRgNCwXHJcbiAgICogQHBhcmFtIGxpbmsgICAgICAtINGB0YHRi9C70LrQsFxyXG4gICAqIEByZXR1cm4ge3ZvaWR8KnxqUXVlcnl9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaW1hZ2Uoc3JjLGNsYXNzTmFtZSxsaW5rKXtcclxuICAgIHJldHVybiAkKCc8YS8+Jyx7XHJcbiAgICAgIGNsYXNzOiBcInN0b2NrX19wcm9kdWN0IFwiKyBjbGFzc05hbWUsXHJcbiAgICAgIGlkOiBcInByb2R1Y3RfX1wiK3Byb2R1Y3RJZCxcclxuICAgICAgaHJlZjogbGlua1xyXG4gICAgfSlcclxuICAgICAgLmFwcGVuZChcclxuICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczondGV0cmFnb24tMTInfSlcclxuICAgICAgICAgIC5hcHBlbmQoXHJcbiAgICAgICAgICAgICQoJzxkaXYvPicse2NsYXNzOiAndGV0cmFnb25fX3dyYXBwZXInfSlcclxuICAgICAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICAgJCgnPGRpdi8+Jyx7Y2xhc3M6ICd0ZXRyYWdvbl9fY29udGVudCd9KVxyXG4gICAgICAgICAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAgICAgICAgICQoJzxpbWcvPicse1xyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICdwcm9kdWN0X190aHVtYiBkLWJsb2NrIGgtMTAwIHctMTAwJyxcclxuICAgICAgICAgICAgICAgICAgICAgIHNyYzogc3JjLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYWx0OiBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICQodGhpcykuYWRkQ2xhc3MoJ2ludmFsaWQtaW1hZ2Utc3JjJyl9KSxcclxuICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgIClcclxuICAgICAgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQntGC0YDQuNGB0L7QstCw0YLRjCDQutC+0LzQv9C+0L3QtdC90YJcclxuICAgKi9cclxuICBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICByZWNvbW1lbmRlZFByb2R1Y3RzID0gY29tbW9uLnJhbmRvbWl6ZUFycmF5KHJlY29tbWVuZGVkUHJvZHVjdHMpO1xyXG4gICAgJGJvZHkgPSAkKCc8ZGl2Lz4nLCB7Y2xhc3M6ICdyb3cgcHJvZHVjdC1yZXZpZXdfX3JlY29tbWVuZGVkLXByb2R1Y3RzIG10LTUgYm9yZGVyIHJvdW5kZWQnfSlcclxuICAgICAgLmFwcGVuZChcclxuICAgICAgICAkKCc8ZGl2Lz4nLHtjbGFzczonY29sLTEyJ30pXHJcbiAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICAkKCc8aDIvPicse3RleHQ6Y2FwdGlvbn0pXHJcbiAgICAgICAgICApXHJcbiAgICAgICk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAkYm9keS5hcHBlbmQoXHJcbiAgICAgICAgJCgnPGRpdi8+Jywge2NsYXNzOiAnY29sLTMgZC1ub25lIGQtc20tYmxvY2sgcC0xJ30pXHJcbiAgICAgICAgICAuYXBwZW5kKFxyXG4gICAgICAgICAgICBpbWFnZShyZWNvbW1lbmRlZFByb2R1Y3RzW2ldLnRodW1iLCcnLHJlY29tbWVuZGVkUHJvZHVjdHNbaV0ubGluaylcclxuICAgICAgICAgIClcclxuICAgICAgKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuICRib2R5O1xyXG4gIH1cclxuXHJcblxyXG4gIHJldHVybiByZW5kZXIoKTtcclxufVxuLyoqXHJcbiAqINCa0L7QvNC/0L7QvdC10L3RgiDQtNC70Y8g0L7RgtC+0LHRgNCw0LbQtdC90LjRjyDQutC+0LzQvNC10L3RgtCw0YDQuNC10LIg0Log0LfQsNC60LDQt9GDXHJcbiAqIEBwYXJhbXMge29iamVjdH0gcGFyYW1zXHJcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLmNvbnRhaW5lciAgLSDQutC+0L3RgtC10LnQvdC10YAg0LTQu9GPINGA0LDQt9C80LXRidC10L3QuNGPINGN0LvQtdC80LXQvdGC0LBcclxuICogQHBhcmFtICB7W119ICAgICBwYXJhbXMuc2l6ZUxpc3QgICAtINGB0L/QuNGB0L7QuiDRgNCw0LfQvNC10YDQvtCyXHJcbiAqIEBhdXRob3Igc2tpcHBlclRlYW1cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5mdW5jdGlvbiBDb21wb25lbnRTaXplKHBhcmFtcyl7XHJcbiAgdmFyIGNvbnRhaW5lciA9IHBhcmFtcy5jb250YWluZXIsXHJcbiAgICBzaXplTGlzdCAgICA9IHBhcmFtcy5zaXplTGlzdCxcclxuICAgICRib2R5ICAgICAgID0gJycsXHJcbiAgICBjb3VudGVyICAgICA9IDE7XHJcblxyXG4gIC8qKlxyXG4gICAqINCh0L7Qt9C00LDRgtGMINGN0LvQtdC80LXQvdGCINCy0YvQsdC+0YDQsCDRgNCw0LfQvNC10YDQsCDQv9GA0L7QtNGD0LrRgtCwXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRodW1iIC0g0YHRgdGL0LvQutCwINC90LAg0LrQsNGA0YLQuNC90LrRg1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lICAtINC90LDQuNC80LXQvdC+0LLQsNC90LjQtSDRjdC70LXQvNC10L3RgtCwXHJcbiAgICogQHJldHVybnMgeyp8alF1ZXJ5fEhUTUxFbGVtZW50fVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGNyZWF0ZVNpemVJdGVtKHRodW1iLG5hbWUpe1xyXG4gICAgcmV0dXJuICQoJzxvcHRpb24vPicse1xyXG4gICAgICAnZGF0YS1pbWctc3JjJzogdGh1bWIsXHJcbiAgICAgIHRleHQ6IG5hbWUsXHJcbiAgICAgICdkYXRhLWltZy1sYWJlbCc6IG5hbWUsXHJcbiAgICAgIHZhbHVlOiBjb3VudGVyICsrXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCe0YLRgNC40YHQvtCy0LDRgtGMINC60L7QvNC/0L7QvdC10L3RglxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHJlbmRlcigpe1xyXG4gICAgJGJvZHkgPSAkKCc8ZGl2Picse2NsYXNzOiAncHJvZHVjdC1yZXZpZXdfX3NpemVzLWNvbnRhaW5lcid9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgICQoJzxzcGFuLz4nLHt0ZXh0Olwi0JLRi9Cx0LXRgNC40YLQtSDRgNCw0LfQvNC10YBcIn0pLFxyXG4gICAgICAgICQoJzxoci8+JyksXHJcbiAgICAgICAgJCgnPHNlbGVjdC8+Jyx7XHJcbiAgICAgICAgICBjbGFzczogXCJpbWFnZS1waWNrZXIgc2hvdy1sYWJlbHMgc2hvdy1odG1sXCIsXHJcbiAgICAgICAgICAnZGF0YS1saW1pdCcgOiAxXHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuXHJcbiAgICBzaXplTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKHNpemUsaSl7XHJcbiAgICAgICRib2R5LmZpbmQoJ3NlbGVjdCcpLmFwcGVuZCggY3JlYXRlU2l6ZUl0ZW0oc2l6ZS5pbWFnZSxzaXplLm5hbWUpIClcclxuICAgIH0pO1xyXG5cclxuICAgICRib2R5LmFwcGVuZFRvKGNvbnRhaW5lcik7XHJcbiAgICAkYm9keS5maW5kKCdzZWxlY3QnKS5pbWFnZXBpY2tlcih7c2hvd19sYWJlbDogdHJ1ZX0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICog0JLQvtC30LLRgNCw0YLQuNGC0Ywg0L3QsNC30LLQsNC90LjQtSDQstGL0LHRgNCw0L3QvtCz0L4g0Y3Qu9C10LzQtdC90YLQsFxyXG4gICAqL1xyXG4gIHRoaXMuZ2V0RGF0YSA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gJGJvZHlcclxuICAgICAgLmZpbmQoXCIuaW1hZ2VfcGlja2VyX3NlbGVjdG9yXCIpXHJcbiAgICAgIC5maW5kKCcuc2VsZWN0ZWQnKVxyXG4gICAgICAuZmluZCgncCcpXHJcbiAgICAgIC50ZXh0KClcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiDQktGL0LTQtdC70LjRgtGMINGN0LvQtdC80LXQvdGCXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICovXHJcbiAgdGhpcy5zZXREYXRhID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgLy9UT0RPIHNldCBpdGVtXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICog0KTRg9C90LrRhtC40Y8g0LrQvtC90YHRgtGA0YPQutGC0L7RgFxyXG4gICAqL1xyXG4gIChmdW5jdGlvbigpe1xyXG4gICAgcmVuZGVyKCk7XHJcbiAgfSkoKVxyXG59XG4vKipcclxuICog0JLRi9Cx0L7RgCDQstC60YPRgdCwXHJcbiAqINCV0YHQu9C4INGD0LrQsNC30LDQvSDQvNCw0YHRgdC40LIg0LLQutGD0YHQvtCyINGC0L4g0LHRg9C00LXRgiDRgdC+0LfQtNCw0L0g0YHQtdC70LXQutGCINGBINCy0L7Qt9C80L7QttC90L7RgdGC0Ywg0LLRi9Cx0L7RgNCwINCy0LrRg9GB0LAsINC/0YDQuCDRjdGC0Lwg0YHRgNCw0LfRg1xyXG4gKiDQsdGD0LTQtdGCINGB0YTQvtGA0LzQuNGA0L7QstCw0L0gUmFuZ2VTbGlkZXIg0LTQu9GPINGD0LrQsNC30LDQvdC40Y8g0LrQvtC70LjRh9C10YHRgtCy0LAg0LXQtNC40L3QuNGGINGC0L7QstCw0YDQsCDQtNCw0L3QvdC+0LPQvlxyXG4gKiDQstC60YPRgdCwLiDQldGB0LvQuCDRg9C60LDQt9Cw0L0g0LXQtNC40L3RgtGB0YLQstC10L3QvdGL0Lkg0Y3Qu9C10LzQtdC9LCDRgtC+INGB0LXQu9C10LrRgiDQstGL0LHQvtGA0LAg0LLQutGD0YHQvtCyINGE0L7RgNC80LjRgNC+0LLQsNGC0YzRgdGPINC90LUg0LHRg9C00LXRglxyXG4gKiBAcGFyYW1zIHBhcmFtc1xyXG4gKiBAcGFyYW0ge29iamVjdH0gIHBhcmFtcy5jb250YWluZXJcclxuICogQHBhcmFtIHtudW1iZXJ9ICBwYXJhbXMucHJvZHVjdElkIC0g0JjQlCDQv9GA0L7QtNGD0LrRgtCwXHJcbiAqIEBwYXJhbSB7W119ICAgICAgcGFyYW1zLnRhc3RlTGlzdCAtINC80LDRgdGB0LjQsiDQtNC+0YHRgtGD0L/QvdGL0YUg0LLQutGD0YHQvtCyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSAgcGFyYW1zLm1vZGUgICAgICAtINGA0LXQttC40Lwg0L7RgtC+0LHRgNCw0LbQtdC90LjRjyAo0L7QtNC40L0g0LLQutGD0YF80LzQvdC+0LbQtdGB0YLQstC+INCy0LrRg9GB0L7QsilcclxuICogQHBhcmFtcyB7b2JqZWN0fSBwYXJhbXMuc2xpZGVyT3B0IC0g0LLRgdC1INC/0LDRgNCw0LzQtdGC0YDRiyDQtNC70Y8g0LjQvdC40YbQuNCw0LvQuNC30LDRhtC40Lgg0LrQvtC80L/QvtC90LXQvdGC0LAgXCLQlNC40LDQv9Cw0LfQvtC9INC30L3QsNGH0LXQvdC40LlcIlxyXG4gKiDQodCy0L7QudGB0YLQstCwIHBhcmFtcy5zbGlkZXJPcHQ6XHJcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyYW1zLnNsaWRlck9wdC5yYW5nZVNsaWRlckNvbnRhaW5lclxyXG4gKiBAcGFyYW0gIHsqfSAgICAgIHBhcmFtcy5zbGlkZXJPcHQuaW5kZXhcclxuICogQHBhcmFtICB7c3RyaW5nfSBwYXJhbXMuc2xpZGVyT3B0LmNhcHRpb25cclxuICogQHBhcmFtICB7bnVtYmVyfSBwYXJhbXMuc2xpZGVyT3B0LnByb2R1Y3RzSW5SYXRpb25cclxuICogQHBhcmFtICB7bnVtYmVyfSBwYXJhbXMuc2xpZGVyT3B0Lm1pblxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHBhcmFtcy5zbGlkZXJPcHQubWF4XHJcbiAqIEBwYXJhbSAge251bWJlcn0gcGFyYW1zLnNsaWRlck9wdC5zdGVwXHJcbiAqIEBwYXJhbSAge251bWJlcn0gcGFyYW1zLnNsaWRlck9wdC53ZWlnaHRcclxuICogQHBhcmFtICB7bnVtYmVyfSBwYXJhbXMuc2xpZGVyT3B0LmJyZWFrcG9pbnRzXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gQ29tcG9uZW50VGFzdGUocGFyYW1zKXtcclxuICB2YXIgY29udGFpbmVyID0gcGFyYW1zLmNvbnRhaW5lcixcclxuICAgIHByb2R1Y3RJZCAgID0gcGFyYW1zLnByb2R1Y3RJZCxcclxuICAgIHRhc3RlTGlzdCAgID0gcGFyYW1zLnRhc3RlTGlzdCxcclxuICAgIG1vZGUgICAgICAgID0gcGFyYW1zLm1vZGUsXHJcbiAgICBzbGlkZXJPcHQgICA9IHBhcmFtcy5zbGlkZXJPcHQsXHJcbiAgICAkYm9keSxcclxuICAgICRjb21wb25lbnQgID0gJyc7XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZVRhc3RlSXRlbSh2YWx1ZSxuYW1lLGlzU2VsZWN0ZWQpe1xyXG4gICAgaWYoIWlzU2VsZWN0ZWQpIGlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHJldHVybiAkKCc8b3B0aW9uLz4nLHtcclxuICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICB0ZXh0OiBuYW1lLFxyXG4gICAgICBzZWxlY3RlZDogaXNTZWxlY3RlZFxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqINCe0YLRgNC40YHQvtCy0LDRgtGMINC60L7QvNC/0L7QvdC10L3RglxyXG4gICAqINCV0YHQu9C4INCyINC90LDRgdGC0YDQvtC50LrQsNGFINC/0LDRgNCw0LzQtdGC0YAgXCJ0YXN0ZUxpc3RcIiDRgdC+0LTQtdGA0LbQuNGCINC80LDRgdGB0LjQsiDQt9C90LDRh9C10L3QuNC5LCDQt9C90LDRh9C40YIg0L7RgtC+0LHRgNCw0LfQuNGC0Ywg0YHQtdC70LXQutGCINCy0LrRg9GB0L7QsixcclxuICAgKiDQv9GA0Lgg0LLRi9Cx0L7RgNC1INC+0L/RgNC10LTQtdC70ZHQvdC90L7Qs9C+INCy0LrRg9GB0LAg0YHQvtC30LTQsNC10YLRgdGPIFJhbmdlU2xpZGVyXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcmVuZGVyKCl7XHJcbiAgICAkYm9keSA9ICQoJzxkaXYvPicse2NsYXNzOiAncHJvZHVjdC1yZXZpZXdfX3Rhc3RlLWNvbnRhaW5lcid9KVxyXG4gICAgICAuYXBwZW5kKFxyXG4gICAgICAgICQoJzxzcGFuLz4nLHt0ZXh0OiAodGFzdGVMaXN0Lmxlbmd0aCA+IDEgPyBcItCj0LrQsNC20LjRgtC1INCy0LrRg9GBXCIgOiBcItCj0LrQsNC20LjRgtC1INC60L7Qu9C40YfQtdGB0YLQstC+XCIpfSksXHJcbiAgICAgICAgJCgnPGhyPicpLFxyXG4gICAgICAgICQoJzxzZWxlY3QvPicse1xyXG4gICAgICAgICAgaWQ6XCJ0YXN0ZS1zZWxlY3RfXCIrcHJvZHVjdElkLFxyXG4gICAgICAgICAgY2xhc3M6IFwiY2FyZF9fdGFzdGUtc2VsZWN0IG11bHRpcGxlU2VsZWN0XCIsXHJcbiAgICAgICAgICBtdWx0aXBsZTogdHJ1ZSxcclxuICAgICAgICAgIG5hbWU6ICd0YXN0ZSdcclxuICAgICAgICB9KSxcclxuICAgICAgICAkKCc8ZGl2Lz4nLHtcclxuICAgICAgICAgIGNsYXNzOiAndGFzdGUtc2VsZWN0X19yYW5nZScsXHJcbiAgICAgICAgICBpZDogJ3Rhc3RlLXNlbGVjdF9fcmFuZ2UtJytwcm9kdWN0SWRcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgdGFzdGVMaXN0LmZvckVhY2goZnVuY3Rpb24odGFzdGUsaSl7XHJcbiAgICAgICRib2R5LmZpbmQoJ3NlbGVjdCcpLmFwcGVuZCggY3JlYXRlVGFzdGVJdGVtKHRhc3RlLnZhbCx0YXN0ZS5uYW1lLCBpID09PSAwICkpXHJcbiAgICB9KTtcclxuXHJcbiAgICAkYm9keS5hcHBlbmRUbyhjb250YWluZXIpO1xyXG4gICAgc2xpZGVyT3B0LnJhbmdlU2xpZGVyQ29udGFpbmVyID0gJGJvZHkuZmluZCgnI3Rhc3RlLXNlbGVjdF9fcmFuZ2UtJytwcm9kdWN0SWQpO1xyXG5cclxuICAgIGlmKCBpc011bHRpcGxlVGFzdGVzKCkgKVxyXG4gICAgICBpbml0VGFzdGVzKCk7XHJcbiAgICBlbHNlIHtcclxuICAgICAgJCgnI3Rhc3RlLXNlbGVjdF8nK3Byb2R1Y3RJZCkuaGlkZSgpO1xyXG4gICAgICBuZXcgUmFuZ2VTbGlkZXIoc2xpZGVyT3B0KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCS0L7Qt9Cy0YDQsNGC0LjRgtGMINCy0YvRh9C40YHQu9C10L3QvdGL0Lkg0LLQtdGBINGC0L7RgNGC0LBcclxuICAgKiDQstC10YEg0L7QtNC90L7Qs9C+INC60YPRgdC60LAv0YjRgtGD0LrQuCDQt9Cw0LTQsNGR0YLRgdGPINC/0LDRgNCw0LzQtdGC0YDQvtC8IFwid2VpZ2h0XCIg0LIg0L3QsNGB0YLRgNC+0LnQutCw0YVcclxuICAgKiBAcGFyYW0ge1JhbmdlU2xpZGVyfSBpdGVtXHJcbiAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGdldENhbGN1bGF0ZWRDYWtlV2VpZ2h0KGl0ZW0pe1xyXG4gICAgcmV0dXJuICskKGl0ZW0pLmZpbmQoJy5yYW5nZV9fY291bnQnKS52YWwoKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiDQktC+0LfQstGA0LDRgtC40YLRjCDQstGL0YfQuNGB0LvQtdC90L3QvtC1INC60L7Qu9C40YfQtdGB0YLQstC+INC/0L7RgNGG0LjQuVxyXG4gICAqINGB0L7QvtGC0L3QvtGI0LXQvdC40LUg0L/QvtGA0YbQuNC5INC6INC60L7Qu9C40YfQtdGB0YLQstGDINC30LDQtNCw0ZHRgtGB0Y8g0L/QsNGA0LDQvNC10YLRgNC+0LwgXCJyYXRpb25cIiDQsiDQvdCw0YHRgtC+0LnQutCw0YVcclxuICAgKiBAcGFyYW0ge1JhbmdlU2xpZGVyfSBpdGVtXHJcbiAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGdldENhbGN1bGF0ZWRSYXRpb25Db3VudChpdGVtKXtcclxuICAgIHJldHVybiArJChpdGVtKS5maW5kKCcucmFuZ2VfX3JhdGlvbi1jb3VudCcpLnZhbCgpXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JLQvtC30LLRgNCw0YLQuNGC0Ywg0LfQvdCw0YfQtdC90LjQtSDRgdC70LDQudC00LXRgNCwXHJcbiAgICog0YjQsNCzINGB0LvQsNC50LTQtdGA0LAg0LfQsNC00LDQtdGC0YHRjyDQv9Cw0YDQsNC80LXRgtGA0L7QvCBcInN0ZXBcIiDQvtC00L3QsNC60L4gKNC70YPRh9GI0LUg0LjRgdGC0L7Qu9GM0LfQvtCy0LDRgtGMIDEg0YLQsNC6INC60LDQuiDRgSDQtNGA0L7QsdC90YvQvNC4INC30L3QsNGH0LXQvdC40Y/QvNC4INCy0L7Qt9C90LjQutCw0Y7RgiDQvtGI0LjQsdC60LgpXHJcbiAgICog0LzQuNC90LjQvNCw0LvRjNC90L7QtSDQt9C90LDRh9C10L3QuNC1INC/0LDRgNCw0LzQtdGC0YDQvtC8IFwibWluXCIsINC80LDQutGB0LjQvNCw0LvRjNC90L7QtSAtIFwibWF4XCIg0LIg0L3QsNGB0YLRgNC+0LnQutCw0YVcclxuICAgKiBAcGFyYW0ge1JhbmdlU2xpZGVyfSBpdGVtXHJcbiAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGdldFJhbmdlVmFsdWUoaXRlbSl7XHJcbiAgICByZXR1cm4gKyQoaXRlbSkuZmluZCgnLnJhbmdlX192YWx1ZScpLnZhbCgpXHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICog0JLQvtC30LLRgNCw0YLQuNGC0Ywg0LTQsNC90L3Ri9C1INC/0L4g0LLRgdC10Lwg0YPQutCw0LfQsNC90L3Ri9C8INCy0LrRg9GB0LDQvFxyXG4gICAqIEByZXR1cm4ge1tdfVxyXG4gICAqL1xyXG4gIHRoaXMuZ2V0RGF0YSA9IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgdGFzdGVzID0gW107XHJcbiAgICAkYm9keS5maW5kKCcucmFuZ2UnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LHJhbmdlKXtcclxuICAgICAgdmFyICRpdGVtID0gJChyYW5nZSkuZmluZCgnLnJhbmdlX19jYXB0aW9uJyk7XHJcbiAgICAgIHZhciB0YXN0ZSA9ICRpdGVtLmF0dHIoJ2RhdGEtdGFzdGUtbmFtZScpID09PSAkaXRlbS52YWwoKSA/XHJcbiAgICAgICAgJGl0ZW0udmFsKCkgOlxyXG4gICAgICAgICRpdGVtLmF0dHIoJ2RhdGEtdGFzdGUtbmFtZScpICsgJyAoJyArICRpdGVtLnZhbCgpICsgJyknO1xyXG4gICAgICB0YXN0ZSA9IHRhc3RlID8gdGFzdGUgOiAn0LXQtNC40L3RgdGC0LLQtdC90L3Ri9C5JztcclxuICAgICAgdGFzdGVzLnB1c2goXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGFzdGUgICAgICAgOiB0YXN0ZSxcclxuICAgICAgICAgIHdlaWdodCAgICAgIDogZ2V0Q2FsY3VsYXRlZENha2VXZWlnaHQocmFuZ2UpLFxyXG4gICAgICAgICAgdmFsdWUgICAgICAgOiBnZXRSYW5nZVZhbHVlKHJhbmdlKSxcclxuICAgICAgICAgIHJhdGlvbkNvdW50IDogZ2V0Q2FsY3VsYXRlZFJhdGlvbkNvdW50KHJhbmdlKSxcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiB0YXN0ZXM7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdFRhc3RlcygpIHtcclxuICAgICRjb21wb25lbnQgPSAkKCcjdGFzdGUtc2VsZWN0XycrcHJvZHVjdElkKTtcclxuICAgICRjb21wb25lbnQuZmFzdHNlbGVjdCh7XHJcbiAgICAgIHBsYWNlaG9sZGVyOiBcItCS0YvQsdC10YDQuNGC0LUg0LjQvdCw0YfQtSDQvNGLINCy0YvQsdC10YDQtdC8INGB0LDQvNC4IDopXCIsXHJcbiAgICAgIGNvbnRyb2xzQ2xhc3M6ICd0YXN0ZS1zZWxlY3RfJytwcm9kdWN0SWQrJ19fZnN0Q29udHJvbHMnLFxyXG4gICAgICBvbkl0ZW1TZWxlY3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvL1RPRE86INC/0YDQvtCy0LXRgNC60LAg0L3QsCDRgtC+INGH0YLQviDRjdC70LXQvNC10L3RgiDRg9C20LUg0LLRi9Cx0YDQsNC9ICjQuNC70Lgg0L7RgdGC0LDQstC40YIg0Y3RgtC+INC60LDQuiDRhNC40YfRgz8pXHJcbiAgICAgICAgdmFyIHRhc3RlQmluZCA9IGdldFNlbGVjdGVkVGFzdGUoKTtcclxuICAgICAgICBhZGRMaXN0ZW5lckZvclJlbW92ZVRhc3RlKHRhc3RlQmluZCk7XHJcbiAgICAgICAgbmV3IFJhbmdlU2xpZGVyKCB1cGRTbGlkZXJPcHQoZ2V0VGFzdGVJZGVudGlmaWVyKHRhc3RlQmluZCksZ2V0VGFzdGVOYW1lKHRhc3RlQmluZCkpIClcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgLy92YXIgdGFzdGVDb250YWluZXIgPSBnZXRDb250YWluZXIoKTtcclxuICAgIHZhciBzZWxlY3RlZFRhc3RlID0gZ2V0U2VsZWN0ZWRUYXN0ZSgpOy8vJCh0YXN0ZUNvbnRhaW5lcikuZmluZCgnLmZzdENob2ljZUl0ZW0nKTtcclxuICAgIGFkZExpc3RlbmVyRm9yUmVtb3ZlVGFzdGUoc2VsZWN0ZWRUYXN0ZSk7XHJcbiAgICBuZXcgUmFuZ2VTbGlkZXIoIHVwZFNsaWRlck9wdChnZXRUYXN0ZUlkZW50aWZpZXIoc2VsZWN0ZWRUYXN0ZSksZ2V0VGFzdGVOYW1lKHNlbGVjdGVkVGFzdGUpKSApO1xyXG4gIH1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIHVwZFNsaWRlck9wdChfaW5kZXgsX2NhcHRpb24pIHtcclxuICAgIHNsaWRlck9wdC5pbmRleCA9IF9pbmRleDtcclxuICAgIHNsaWRlck9wdC5jYXB0aW9uID0gX2NhcHRpb247XHJcbiAgICByZXR1cm4gc2xpZGVyT3B0XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGRMaXN0ZW5lckZvclJlbW92ZVRhc3RlKHRhc3RlKSB7XHJcbiAgICAkKHRhc3RlKS5vbignY2xpY2snLCAnYnV0dG9uLmZzdENob2ljZVJlbW92ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCgnIycgKyAkKHRhc3RlKS5hdHRyKCdkYXRhLXZhbHVlJykpLnJlbW92ZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiDQn9GA0L7QstC10YDQutCwXHJcbiAgICogQHJldHVybiB7KltdfGJvb2xlYW59XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaXNNdWx0aXBsZVRhc3RlcygpIHtcclxuICAgIHJldHVybiB0YXN0ZUxpc3QgJiYgdGFzdGVMaXN0Lmxlbmd0aCA+IDFcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqINCS0L7Qt9Cy0YDQsNGC0LjRgtGMINGD0LrQsNC30LDRgtC10LvRjCDQvdCwINC60L3QvtC/0LrRgyDRg9C00LDQu9C10L3QuNGPINCy0LrRg9GB0LBcclxuICAgKiAh0L3QtdC+0LHRhdC+0LTQuNC80L4g0LTQu9GPINGD0LTQsNC70LXQvdC40Y8g0LrQvtC80L/QvtC90LXQvdGC0LAgXCLQlNC40LDQv9Cw0LfQvtC9INC30L3QsNGH0LXQvdC40LlcIiAoUmFuZ2VTbGlkZXIpINGB0L7Qt9C00LDQvdC90L7Qs9C+INC/0YDQuCDQstGL0LHQvtGA0LUg0Y3RgtC+0LPQviDQstC60YPRgdCwXHJcbiAgICogQHJldHVybiB7alF1ZXJ5fVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGdldFNlbGVjdGVkVGFzdGUoKXtcclxuICAgIHJldHVybiAkKCcudGFzdGUtc2VsZWN0XycrcHJvZHVjdElkKydfX2ZzdENvbnRyb2xzPmRpdjpsYXN0JykuZ2V0KDApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICog0JLQvtC30LLRgNCw0YLQuNGC0Ywg0LjQtNC10L3RgtC40YTQuNC60LDRgtC+0YAg0LLQutGD0YHQsFxyXG4gICAqIEBwYXJhbSBzZWxlY3RlZFRhc3RlXHJcbiAgICogQHJldHVybiB7KnxqUXVlcnl9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2V0VGFzdGVJZGVudGlmaWVyKHNlbGVjdGVkVGFzdGUpe1xyXG4gICAgcmV0dXJuICQoc2VsZWN0ZWRUYXN0ZSkuYXR0cignZGF0YS12YWx1ZScpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqINCS0L7Qt9Cy0YDQsNGC0LjRgtGMINC90LDQt9Cy0LDQvdC40LUg0LLQutGD0YHQsFxyXG4gICAqIEBwYXJhbSBzZWxlY3RlZFRhc3RlXHJcbiAgICogQHJldHVybiB7KnxqUXVlcnl9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2V0VGFzdGVOYW1lKHNlbGVjdGVkVGFzdGUpe1xyXG4gICAgcmV0dXJuICQoc2VsZWN0ZWRUYXN0ZSkuYXR0cignZGF0YS10ZXh0Jyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiDQktC+0LfQstGA0LDRgtC40YLRjCDQutC+0L3RgtC10LnQvdC10YBcclxuICAgKiBAcmV0dXJuIHtqUXVlcnl9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2V0Q29udGFpbmVyKCl7XHJcbiAgICB2YXIgdGFzdGVDb250YWluZXIgPSAkY29tcG9uZW50LmdldCgwKTtcclxuICAgIHJldHVybiAkKHRhc3RlQ29udGFpbmVyKS5jbG9zZXN0KCcuZnN0RWxlbWVudCcpLmdldCgwKTtcclxuICB9XHJcblxyXG4gIChmdW5jdGlvbigpe1xyXG4gICAgcmVuZGVyKCk7XHJcbiAgfSkoKVxyXG59XHJcblxyXG4iXSwiZmlsZSI6ImJ1bmRsZS5qcyJ9
