document.addEventListener("DOMContentLoaded", function() {
    // 1. Línea de progreso de la etapa actual
    const steps = document.querySelectorAll(".timeline-step");
    let lastCompletedIdx = -1;
    steps.forEach((step, idx) => {
        if (step.classList.contains("completed") || step.classList.contains("active")) {
            lastCompletedIdx = idx;
        }
    });
    
    if (lastCompletedIdx >= 0) {
        const progressPercent = (lastCompletedIdx / (steps.length - 1)) * 100;
        const progressElement = document.getElementById("timeline-progress-width");
        if (progressElement) {
            progressElement.style.width = progressPercent + "%";
        }
    }

    // 2. Buscador/filtro de órdenes
    const searchInput = document.getElementById("orden-search-input");
    const listContainer = document.getElementById("ordenes-list-container");
    const items = document.querySelectorAll(".orden-search-item");
    const noResultsMsg = document.getElementById("no-results-msg");

    if (searchInput && listContainer) {
        // Mostrar lista al enfocar el buscador
        searchInput.addEventListener("focus", function() {
            listContainer.style.display = "block";
        });

        // Filtrar órdenes mientras se escribe
        searchInput.addEventListener("input", function() {
            const query = this.value.toLowerCase().trim();
            let visibleCount = 0;

            items.forEach(function(item) {
                const text = (item.getAttribute("data-search-text") || "").toLowerCase();
                if (!query || text.includes(query)) {
                    item.style.display = "flex";
                    visibleCount++;
                } else {
                    item.style.display = "none";
                }
            });

            if (noResultsMsg) {
                noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
            }

            // Asegurar que la lista esté visible al escribir
            if (listContainer.style.display === "none") {
                listContainer.style.display = "block";
            }
        });

        // Cerrar lista al hacer clic fuera
        document.addEventListener("click", function(e) {
            if (!searchInput.contains(e.target) && !listContainer.contains(e.target)) {
                listContainer.style.display = "none";
            }
        });
    }
});
