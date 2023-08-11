


function openPopup(projectId: string, type: string) {
    dispatchEvent(new CustomEvent("popup", {
        detail: {
            type: type,
            projectId: projectId
        }
    }));
}

export { openPopup };