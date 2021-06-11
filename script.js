function totalValue() {
  const items = JSON.parse(window.localStorage.getItem('cartItems'));
  const priceElement = document.querySelector('.total-price');
  if (items) {
    const price = items.reduce((acc, item) => (acc + parseFloat(item.price)), 0);
    priceElement.innerText = price.toFixed(2);
  } else {
    priceElement.innerText = 0;
  } 
}

function saveCartList() {
  const cartList = document.querySelectorAll('.cart__item');
  if (cartList.length > 0) {
    const cartListTextArr = Array.from(cartList).reduce((acc, item) => {
      const thumbnail = item.querySelector('.item__image').src;
      const id = item.querySelector('.cart__specs').querySelector('.cart__id').innerText;
      const title = item.querySelector('.cart__specs').querySelector('.cart__text').innerText;
      const price = item.querySelector('.cart__specs').querySelector('.cart__price').innerText.slice(10);
      const itemObj = {
        thumbnail,
        id,
        title,
        price,
      };
      return [...acc, itemObj];
    }, []);
  window.localStorage.setItem('cartItems', JSON.stringify(cartListTextArr));
  } else {
    window.localStorage.setItem('cartItems', null);
  }
  totalValue();
}

async function requestApi(url, callback) {
  try {
    showLoading();
    await fetch(url)
      .then((r) => r.json())
      .then((r) => callback(r))
      .then(() => closeLoading())
      .catch((error) => console.log(error));
  } catch(error) {
    console.log(error);
  }
}

function appendElement(el, parent) {
  if (typeof parent === 'string') {
    parent = document.querySelector(`.${parent}`);
  }
  parent.appendChild(el);
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText, callback) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  if (callback) {
    callback(e);
  }
  return e;
}

function cartItemClickEvent(item) {
  item.addEventListener('click', () => {
    const parent = item.parentElement;
    parent.removeChild(item);
    saveCartList();
  })
}

function createCartItemElement({ id, title, price, thumbnail }) {
  const elementThumbnail = createProductImageElement(thumbnail);
  const aboutElement = createCustomElement('div', 'cart__specs', null);
  const elementId = createCustomElement('p', 'cart__id', id);
  const elementText = createCustomElement('p', 'cart__text', title);
  const elementPrice = createCustomElement('p', 'cart__price', `Preço: R$ ${parseFloat(price).toFixed(2)}`);
  const element = createCustomElement('div', 'cart__item', null, cartItemClickEvent);

  appendElement(elementThumbnail, element);
  appendElement(elementId, aboutElement);
  appendElement(elementText, aboutElement);
  appendElement(elementPrice, aboutElement);
  appendElement(aboutElement, element);
  appendElement(element, 'cart__items');
  saveCartList();
}

function catalogItemButtonEvent(btn) {
  btn.addEventListener('click', () => {
    const parent = btn.parentElement;
    const id = parent.querySelector('.item__id').innerText;
    const url = `https://api.mercadolibre.com/items/${id}`;
    requestApi(url, createCartItemElement);
  })
}

function createProductItemElement(obj) {
  const { id, title, thumbnail } = obj;
  const section = document.createElement('section');
  section.className = 'item';
  
  section.appendChild(createProductImageElement(thumbnail));
  section.appendChild(createCustomElement('span', 'item__title', title));
  section.appendChild(createCustomElement('span', 'item__id', id));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!', catalogItemButtonEvent));

  return section;
}

function createCatalog(resolve) {
  resolve.results.forEach((product) => {
    const productElement = createProductItemElement(product);
    appendElement(productElement, 'items');
  });
}

function loadCartList() {
  const storage = JSON.parse(window.localStorage.getItem('cartItems'));
  if (storage) {
    storage.forEach((item) => createCartItemElement(item));
  }
}

function showLoading() {
  const loading = createCustomElement('p', 'loading', 'loading...');
  appendElement(loading, 'cart');
}

function closeLoading() {
  const parent = document.querySelector('.cart');
  const loading = document.querySelector('.loading');
  parent.removeChild(loading);
}

function addNewCatalog(search) {
  const url = `https://api.mercadolibre.com/sites/MLB/search?q=${search}`;
  requestApi(url, createCatalog);
}

function clearCatalog() {
  const catalog = document.querySelector('.items');
  const items = document.querySelectorAll('.item');
  items.forEach((item) => catalog.removeChild(item));
}

function searchEventListener() {
  const searchBar = document.querySelector('#search-bar');
  searchBar.addEventListener('keypress', (e) => {
    if(e.keyCode === 13){
      e.preventDefault();
      clearCatalog();
      addNewCatalog(searchBar.value);
    };
  })
}

function emptyCart() {
  const btn = document.querySelector('.empty-cart');
  btn.addEventListener('click', () => {
    const cartList = document.querySelectorAll('.cart__item');
    const parent = document.querySelector('.cart__items');
    cartList.forEach((item) => parent.removeChild(item));
    saveCartList();
  });
}

window.onload = function onload() {
  loadCartList();
  emptyCart();
  const url = 'https://api.mercadolibre.com/sites/MLB/search?q=computador';
  requestApi(url, createCatalog)
    .then(() => searchEventListener());
};