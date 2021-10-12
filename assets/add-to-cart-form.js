let
    addToCartFormSelector = '#add-to-cart-form',
    productOptionSelector = addToCartFormSelector + ' [name*=option]';

  let productForm = {
    onProductOptionChanged: function(event) {
      let
        form = this.closest(addToCartFormSelector),
        selectedVariant = productForm.getActiveVariant(form);

      form.trigger('form:change', [selectedVariant]);
    },
    serializeArray: function (form) {
      const formData = new FormData(form);
      const data = [];

      for (const [name, value] of formData) {
        data.push({ name, value });
      }
      return data;
      
    },
    getActiveVariant: function (form) {
      let
        variants = JSON.parse(decodeURIComponent(form.getAttribute('data-variants'))),
        formData = this.serializeArray(form),
        formOptions = {
          option1: null,
          option2: null,
          option3: null
        },
        selectedVariant = null;

        formData.forEach(function(item, index){
	        if (item.name.indexOf('option') !== -1) {
            formOptions[item.name] = item.value;
          }
        });

        variants.forEach(function(variant, index){
	        if (variant.option1 === formOptions.option1 && variant.option2 === formOptions.option2 && variant.option3 === formOptions.option3) {
            selectedVariant = variant;
            return false;
          }
        });

        return selectedVariant;

    },
    validate: function(event, selectedVariant) {
      let  
        form = this,
        hasVariant = selectedVariant !== null,
        canAddToCart = hasVariant && selectedVariant.inventory_quantity > 0,
        variantId = form.find('.js-variant-id'),
        addToCartButton = form.find('#add-to-cart-button'),
        price = form.find('.js-price'),
        formattedVariantPrice,
        priceHtml;

      if (hasVariant) {
        formattedVariantPrice = '$' + (selectedVariant.price/100).toFixed(2);
        priceHtml = '<span class="money">'+formattedVariantPrice+'</span>';
        window.history.replaceState(null, null, '?variant='+selectedVariant.id);
      } else {
        priceHtml = price.attr('data-default-price');
      }  

      if (canAddToCart) {
        variantId.val(selectedVariant.id);
        addToCartButton.prop('disabled', false);
      } else {
        variantId.value = '';
        addToCartButton.prop('disabled', true);        
      }

      price.innerHTML = priceHtml;
      currencyPicker.onMoneySpanAdded();
    },
    init: function () {
      document.addEventListener('change', function(e) {
        // loop parent nodes from the target to the delegation node
        for (let target = e.target; target && target != this; target = target.parentNode) {
            if (target.matches(productOptionSelector)) {
                productForm.onProductOptionChanged.call(target, e);
                break;
            }
        }
      }, false);
      document.addEventListener('form:change', function(e) {
        // loop parent nodes from the target to the delegation node
        for (let target = e.target; target && target != this; target = target.parentNode) {
            if (target.matches(addToCartFormSelector)) {
                productForm.validate.call(target, e);
                break;
            }
        }
      }, false);
    }
  };

  productForm.init();


