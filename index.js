const itemsPerPage = 100;
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
	$('#pagination-controls-top').empty();
	$('#pagination-controls-bottom').empty();
	
	if (totalPages <= 1) return;

	let paginationHtml = '';

	if (currentPage > 1) {
		paginationHtml += `<li class="page-item"><a class="page-link bg-dark text-light border-dark" href="#" data-page="${currentPage - 1}">Previous</a></li>`;
	} else {
		paginationHtml += `<li class="page-item disabled"><span class="page-link bg-dark text-light border-dark">Previous</span></li>`;
	}

	const maxPagesToShow = 5;
	let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
	let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

	if (endPage - startPage + 1 < maxPagesToShow) {
		startPage = Math.max(1, endPage - maxPagesToShow + 1);
	}

	if (startPage > 1) {
		paginationHtml += `<li class="page-item"><a class="page-link bg-dark text-light border-dark" href="#" data-page="1">1</a></li>`;
		if (startPage > 2) {
			paginationHtml += `<li class="page-item disabled"><span class="page-link bg-dark text-light border-dark">...</span></li>`;
		}
	}

	for (let i = startPage; i <= endPage; i++) {
		if (i === currentPage) {
			paginationHtml += `<li class="page-item active"><span class="page-link bg-dark text-light border-light">${i}</span></li>`;
		} else {
			paginationHtml += `<li class="page-item"><a class="page-link bg-dark text-light border-dark" href="#" data-page="${i}">${i}</a></li>`;
		}
	}

	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			paginationHtml += `<li class="page-item disabled"><span class="page-link bg-dark text-light border-dark">...</span></li>`;
		}
		paginationHtml += `<li class="page-item"><a class="page-link bg-dark text-light border-dark" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
	}

	if (currentPage < totalPages) {
		paginationHtml += `<li class="page-item"><a class="page-link bg-dark text-light border-dark" href="#" data-page="${currentPage + 1}">Next</a></li>`;
	} else {
		paginationHtml += `<li class="page-item disabled"><span class="page-link bg-dark text-light border-dark">Next</span></li>`;
	}

	$('#pagination-controls-top').append(paginationHtml);
	$('#pagination-controls-bottom').append(paginationHtml);

	$('.page-link').on('click', function(event) {
		event.preventDefault();
		const page = parseInt($(this).data('page'), 10);
		if (page !== currentPage && page >= 1 && page <= totalPages) {
			currentPage = page;
			renderTable(currentPage);
			renderPaginationControls();
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
	currentPage = 1;
	renderTable(currentPage);
	renderPaginationControls();
}
