(loadPage = () => {
  fetch("http://localhost:3000/items")
    .then((res) => res.json())
    .then((data) => {
      displayUser(data);
    });
})();

const userDisplay = document.querySelector(".table");

displayUser = (data) => {
  userDisplay.innerHTML = `
    <thead>
    <tr>
      <th>Id</th>
      <th>Nimi</th>
      <th>Puhelin</th>
      <th>Muokkaa</th>
      <th>Poista</th>
    </tr>
    </thead>
     <tbody id="tbody">
    </tbody>
    `;
  displayRow(data);
};

displayRow = (data) => {
  const tbody = document.getElementById("tbody");

  tbody.innerHTML = "";

  data.forEach((user) => {
    tbody.innerHTML += `
      <tr>
          <td>${user.id}</td>
          <td>${user.nimi}</td>
          <td>${user.puhelin}</td>
          <td><input type="button" onClick="editRow(${user.id})" value="Muokkaa"/></td>
          <td><input type="button" onClick="removeRow(${user.id})" value="x"/></td>
      </tr>
  `;
  });
};

// Muokkausfunktio
editRow = (id) => {
  const row = document
    .querySelector(`input[onclick="editRow(${id})"]`)
    .closest("tr");
  const phoneCell = row.cells[2];
  const currentNumber = phoneCell.textContent.trim();
  phoneCell.innerHTML = `<input type="text" value="${currentNumber}" id="edit-${id}" style="width: 120px;"> <button onclick="saveEdit(${id})">Tallenna</button>`;
  const editCell = row.cells[3];
  editCell.innerHTML = "";
};

// Tallennusfunktio
saveEdit = async (id) => {
  const newNumber = document.getElementById(`edit-${id}`).value;
  const response = await fetch(`http://localhost:3000/items/${id}`);
  const user = await response.json();
  user.puhelin = newNumber;
  await fetch(`http://localhost:3000/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  location.reload();
};

removeRow = async (id) => {
  console.log(id);
  // Simple DELETE request with fetch
  let polku = "http://localhost:3000/items/" + id;
  await fetch(polku, { method: "DELETE" }).then(() =>
    console.log("Poisto onnistui"),
  );
  window.location.reload(); //ladataan ikkuna uudelleen
};

/**
 * Helper function for POSTing data as JSON with fetch.
 *
 * @param {Object} options
 * @param {string} options.url - URL to POST data to
 * @param {FormData} options.formData - `FormData` instance
 * @return {Object} - Response body from URL that was POSTed to
 */
async function postFormDataAsJson({ url, formData }) {
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: formDataJsonString,
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Event handler for a form submit event.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
 *
 * @param {SubmitEvent} event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const url = form.action;

  try {
    const formData = new FormData(form);

    const responseData = await postFormDataAsJson({ url, formData });
    await loadPage(); //päivitetään taulukkoon

    console.log({ responseData });
  } catch (error) {
    console.error(error);
  }
}

const exampleForm = document.getElementById("puhelintieto_lomake");
exampleForm.addEventListener("submit", handleFormSubmit);
