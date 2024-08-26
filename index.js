const itemsPerPage = 100;
let csvData = [], filteredData = [], headers = [];
let totalPages = 0, currentPage = 1;

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
	const headerRow = $('<tr></tr>').append(headers.map(header => $('<th></th>').text(header)));
	$('#table-head').empty().append(headerRow);
}

function renderTable(page) {
	const startIndex = (page - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const tableRows = filteredData.slice(startIndex, endIndex).map(row => {
		return $('<tr></tr>').append(row.map((columnData, columnIndex) => {
			return columnIndex === 0
				? $('<td></td>').append(
					$('<a></a>', {
						href: `xbox-live-marketplace-archive/xbox-live-marketplace.en-us/${columnData}.xml`,
						target: '_blank',
						text: columnData,
						css: { 'text-decoration': 'none', 'color': 'inherit' }
					})
				)
				: $('<td></td>').text(columnData).on('click', function(event) {
					if (![1, 2, 6].includes(columnIndex)) {
						event.preventDefault();
						$('#search-input').val(columnData);
						applyFilters();
					}
				});
		}));
	});

	$('#table-body').empty().append(tableRows);
}

function renderPaginationControls() {
	$('.pagination-controls').empty();
	if (totalPages <= 1) return;

	let paginationHtml = '';

	paginationHtml += createPaginationButton('Previous', currentPage > 1 ? currentPage - 1 : null);

	const { startPage, endPage } = calculatePaginationRange();
	
	if (startPage > 1) {
		paginationHtml += createPaginationButton('1', 1);
		if (startPage > 2) paginationHtml += createEllipsis();
	}

	for (let i = startPage; i <= endPage; i++) {
		paginationHtml += createPaginationButton(i, i, i === currentPage);
	}

	if (endPage < totalPages) {
		if (endPage < totalPages - 1) paginationHtml += createEllipsis();
		paginationHtml += createPaginationButton(totalPages, totalPages);
	}

	paginationHtml += createPaginationButton('Next', currentPage < totalPages ? currentPage + 1 : null);

	$('.pagination-controls').append(paginationHtml);
	$('.page-link').on('click', handlePageClick);
}

function createPaginationButton(label, page, isActive = false) {
	return page
		? `<li class="page-item ${isActive ? 'active' : ''}"><a class="page-link bg-dark text-light ${isActive ? 'border-light' : 'border-dark'}" href="#" data-page="${page}">${label}</a></li>`
		: `<li class="page-item disabled"><span class="page-link bg-dark text-light border-dark">${label}</span></li>`;
}


function createEllipsis() {
	return `<li class="page-item disabled"><span class="page-link bg-dark text-light border-dark">...</span></li>`;
}

function calculatePaginationRange() {
	const maxPagesToShow = 5;
	let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
	let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
	if (endPage - startPage + 1 < maxPagesToShow) {
		startPage = Math.max(1, endPage - maxPagesToShow + 1);
	}
	return { startPage, endPage };
}

function handlePageClick(event) {
	event.preventDefault();
	const page = parseInt($(this).data('page'), 10);
	if (page && page !== currentPage && page >= 1 && page <= totalPages) {
		currentPage = page;
		renderTable(currentPage);
		renderPaginationControls();
	}
}

function applyFilters() {
	const query = $('#search-input').val().toLowerCase();
	const selectedType = $('#type-dropdown').val().toLowerCase();

	filteredData = csvData.filter(row =>
		(!query || row.some(col => col.toLowerCase().includes(query))) &&
		(selectedType === '0' || row[1].toLowerCase() === selectedType)
	);

	totalPages = Math.ceil(filteredData.length / itemsPerPage);
	currentPage = 1;
	renderTable(currentPage);
	renderPaginationControls();
}
