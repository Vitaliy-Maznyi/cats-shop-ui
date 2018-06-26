let querySetting = {
  page: 1,
  perPage: 30
}

let cart = {
  items: JSON.parse(localStorage.getItem('items')) || {},
}

const cartList = document.querySelector('.js-cart-list')

setToLocalStorage = (cat) => {
  let items = cart.items
  items[cat.id] = {}
  items[cat.id]['id'] = cat.id
  items[cat.id]['name'] = cat.name
  items[cat.id]['amount'] = 1
  items[cat.id]['price'] = cat.price
  localStorage.setItem('items', JSON.stringify(items))
}

removeFromLocalStorage = (catId) => {
  let items = cart.items
  delete items[catId]
  localStorage.setItem('items', JSON.stringify(items))
}

requestItems = () => {
  const request = new XMLHttpRequest();
  request.open(
    'GET',
    `https://ma-cats-api.herokuapp.com/api/cats?page=${querySetting.page}&per_page=${querySetting.perPage}`,
    true,
  );
  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      querySetting.page += 1;
      createItems(data.cats);
      initLazyLoad();
    }
  };

  request.onerror = () => 'Oh, something went wrong...';
  request.send();
}

createItems = (cats) => {
  cats.forEach((cat) => {
    const catCard = createItem(cat);
    document.querySelector('.catalog').appendChild(catCard);
  });
}

createItem = (cat) => {
  const template = document.getElementById('cat-template').content.firstElementChild.cloneNode(true);

  template.setAttribute('data-id', cat.id);
  template.querySelector('.cat__name').innerHTML = cat.name;
  template.querySelector('.cat__img').setAttribute('alt', `Cat #${cat.id} ${cat.name}`);
  template.querySelector('.cat__img').setAttribute('data-src', cat.img_url);
  template.querySelector('.cat__price').innerHTML = price_humanize(cat.price);
  template.querySelector('.cat__category').children[1].innerHTML = cat.category;

  template.querySelector('.js-add-to-cart').addEventListener("click", () => addToCart(cat, template))

  if (Object.keys(cart.items).includes(cat.id.toString())) template.classList.add('added')
  return template;
}

price_humanize = (price) => {
  const res = price / 100.00;
  return `$${res}`
}

loadMore = () => {
  if (document.documentElement.scrollTop + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
    requestItems();
  }
}

initLazyLoad = () => {
  setLazy();
  lazyLoad();
}


let lazyImages = [];

setLazy = () => {
  lazyImages = document.querySelectorAll("[data-lazy]");
}

lazyLoad = () => {
  for(let i=0; i<lazyImages.length; i++){
    if(isInViewport(lazyImages[i])){
      if (lazyImages[i].getAttribute('data-src')){
        lazyImages[i].src = lazyImages[i].getAttribute('data-src');
        lazyImages[i].removeAttribute('data-src');
        lazyImages[i].parentElement.classList.remove('cat__photo--noimage');
      }
    }
  }

  cleanLazy();
}

cleanLazy = () => {
  lazyImages = Array.prototype.filter.call(lazyImages, (l) => {
    return l.getAttribute('data-src');
  });
}

isInViewport = (el) => {
  const rect = el.getBoundingClientRect();

  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

toggleCart = () => {
  document.querySelector('.js-cart').classList.toggle('cart--visible')
  toggleCartList()
}

Array.from(document.getElementsByClassName('js-toggle-cart')).forEach((el) => {
  el.addEventListener("click", toggleCart)
})

toggleCartList = () => {
  cartList.innerHTML = ''
  if (Object.keys(cart.items).length === 0) {
    document.querySelector('.js-empty-cart').classList.add('show');
    cartList.classList.remove('show');
  } else {
    document.querySelector('.js-empty-cart').classList.remove('show');
    cartList.classList.add('show');
    Object.keys(cart.items).forEach(id => {
      const cartItem = createCartItem(cart.items[id]);
      cartList.appendChild(cartItem);
    });
  }
  countTotalPrice()
}

addToCart = (cat, catalogItem) => {
  if (Object.keys(cart.items).includes(cat.id.toString())) return null
  catalogItem.classList.add('added')
  setToLocalStorage(cat)
  toggleCartList()
}

removeFromCart = (e) => {
  const cartItem = e.target.closest('.cart__item')
  const catId = cartItem.dataset.catId
  if (catId) {
    cartItem.remove()
  } else {
    return null
  }
  removeFromLocalStorage(catId)
  toggleCartList()
  document.querySelector(".catalog__item[data-id='" + catId + "']").classList.remove('added')
}

createCartItem = (cat) => {
  const template = document.getElementById('cart-item-template').content.firstElementChild.cloneNode(true);

  template.setAttribute('data-cat-id', cat.id);
  template.querySelector('.item__name').innerHTML = cat.name;

  if (cat.amount !== 1) {
    template.querySelector('.amount').innerHTML = cat.amount;
  }

  const increaseBtn = template.querySelector('.js-increase');
  increaseBtn.addEventListener('click', () => changeItemsAmount(event, 'increase'));
  const decreaseBtn = template.querySelector('.js-decrease');
  decreaseBtn.addEventListener('click', () => changeItemsAmount(event, 'decrease'));
  const removeBtn = template.querySelector('.js-remove-item');
  removeBtn.addEventListener('click', () => removeFromCart(event));

  return template;
}

changeItemsAmount = (e, changeType) => {
  const cartItem = e.target.closest('.cart__item')
  const counter = e.target.parentElement.parentElement.querySelector('.amount')
  let counterValue = parseInt(counter.innerHTML)
  const catId = cartItem.dataset.catId
  let items = cart.items
  if (changeType === 'increase') {
    items[catId]['amount'] += 1
    counterValue += 1
  } else if (changeType === 'decrease') {
    if (items[catId]['amount'] === 1) return null
    items[catId]['amount'] -= 1
    counterValue -= 1
  }
  localStorage.setItem('items', JSON.stringify(items))
  counter.innerHTML = counterValue.toString()
  countTotalPrice()
}

countTotalPrice = () => {
  const ids = Object.keys(cart.items)
  const totalSpan = document.querySelector(".cart__footer span")
  if (ids.length === 0) {
    totalSpan.innerHTML = price_humanize(0)
  } else {
    const sum = ids.reduce((sum, id) => sum + (cart.items[id]['price'] * cart.items[id]['amount']), 0)
    totalSpan.innerHTML = price_humanize(sum)
  }

}

document.addEventListener("DOMContentLoaded", requestItems)
document.addEventListener("scroll", loadMore)
document.addEventListener("scroll", initLazyLoad)
