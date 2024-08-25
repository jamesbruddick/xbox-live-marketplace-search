// const itemsPerPage = 50;
// let csvData = [];
// let filteredData = [];
// let headers = [];

// $(document).ready(function() {
// 	$.ajax({
// 		url: 'xbox-live-marketplace-archive/xbox-live-marketplace.en-us.csv',
// 		dataType: 'text',
// 	}).done(function(data) {
// 		Papa.parse(data, {
// 			header: false,
// 			complete: function(results) {
// 				csvData = results.data;
// 				headers = csvData.shift();
// 				filteredData = csvData;
// 				renderHeaders();
// 				renderTable(1);
// 			}
// 		});
// 	});

// 	$('#search-input').on('keyup', applyFilters);
// 	$('#type-dropdown').on('change', applyFilters);
// });

// function renderHeaders() {
// 	$('#table-head').empty().append(
// 		$('<tr></tr>').append(headers.map(header => $('<th></th>').text(header)))
// 	);
// }

// function renderTable(page) {
// 	const startIndex = (page - 1) * itemsPerPage;
// 	const endIndex = startIndex + itemsPerPage;
// 	const tableRows = filteredData.slice(startIndex, endIndex);

// 	$('#table-body').empty().append(
// 		tableRows.map(row => {
// 			return $('<tr></tr>').append(
// 				row.map((columnData, columnIndex) => {
// 					if (columnIndex === 0) {
// 						return $('<td></td>').append(
// 							$('<a></a>')
// 								.attr({
// 									href: `xbox-live-marketplace-archive/xbox-live-marketplace.en-us/${columnData}.xml`,
// 									target: '_blank'
// 								})
// 								.text(columnData)
// 								.css({
// 									'text-decoration': 'none',
// 									'color': 'inherit'
// 								})
// 						);
// 					} else {
// 						return $('<td></td>')
// 							.text(columnData)
// 							.on('click', function(event) {
// 								if (columnIndex !== 1&& columnIndex !== 6) {
// 									event.preventDefault();
// 									$('#search-input').val(columnData);
// 									applyFilters();
// 								}
// 							});
// 					}
// 				})
// 			);
// 		})
// 	);
// }

// function applyFilters() {
// 	const query = $('#search-input').val().toLowerCase();
// 	const selectedType = $('#type-dropdown').val().toLowerCase();

// 	filteredData = csvData.filter(row => 
// 		(query === '' || row.some(col => col.toLowerCase().includes(query))) &&
// 		(selectedType === '0' || row[1].toLowerCase() === selectedType)
// 	);

// 	renderTable(1);
// }




const itemsPerPage = 50;
let csvData = [];
let filteredData = [];
let headers = [];
let totalPages = 0;
let currentPage = 1;

$(document).ready(function() {
	$.ajax({
		url: 'xbox-live-marketplace-archive/xbox-live-marketplace.en-us.csv',
		dataType: 'text',
	}).done(function(data) {
		Papa.parse(data, {
			header: false,
			complete: function(results) {
				csvData = results.data;
				headers = csvData.shift();
				filteredData = csvData;
				totalPages = Math.ceil(filteredData.length / itemsPerPage);
				renderHeaders();
				renderTable(currentPage);
				renderPaginationControls();
			}
		});
	});

	$('#search-input').on('keyup', applyFilters);
	$('#type-dropdown').on('change', applyFilters);
});

function renderHeaders() {
	$('#table-head').empty().append(
		$('<tr></tr>').append(headers.map(header => $('<th></th>').text(header)))
	);
}

function renderTable(page) {
	const startIndex = (page - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const tableRows = filteredData.slice(startIndex, endIndex);

	$('#table-body').empty().append(
		tableRows.map(row => {
			return $('<tr></tr>').append(
				row.map((columnData, columnIndex) => {
					if (columnIndex === 0) {
						return $('<td></td>').append(
							$('<a></a>')
								.attr({
									href: `xbox-live-marketplace-archive/xbox-live-marketplace.en-us/${columnData}.xml`,
									target: '_blank'
								})
								.text(columnData)
								.css({
									'text-decoration': 'none',
									'color': 'inherit'
								})
						);
					} else {
						return $('<td></td>')
							.text(columnData)
							.on('click', function(event) {
								if (columnIndex !== 1 && columnIndex !== 6) {
									event.preventDefault();
									$('#search-input').val(columnData);
									applyFilters();
								}
							});
					}
				})
			);
		})
	);
}

function renderPaginationControls() {
	$('#pagination-controls').empty();
	
	if (totalPages <= 1) return;

	let paginationHtml = '';

	for (let i = 1; i <= totalPages; i++) {
		paginationHtml += `<a href="#" class="pagination-link" data-page="${i}">${i}</a> `;
	}

	$('#pagination-controls').append(paginationHtml);

	$('.pagination-link').on('click', function(event) {
		event.preventDefault();
		const page = parseInt($(this).data('page'), 10);
		if (page !== currentPage) {
			currentPage = page;
			renderTable(currentPage);
		}
	});
}

function applyFilters() {
	const query = $('#search-input').val().toLowerCase();
	const selectedType = $('#type-dropdown').val().toLowerCase();

	filteredData = csvData.filter(row => 
		(query === '' || row.some(col => col.toLowerCase().includes(query))) &&
		(selectedType === '0' || row[1].toLowerCase() === selectedType)
	);

	totalPages = Math.ceil(filteredData.length / itemsPerPage);
	currentPage = 1; // Reset to the first page
	renderTable(currentPage);
	renderPaginationControls();
}
