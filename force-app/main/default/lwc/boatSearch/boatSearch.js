import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatSearch extends NavigationMixin(LightningElement) {
    isLoading = false;

    // Handles loading event
    handleLoading() { }

    // Handles done loading event
    handleDoneLoading() { }

    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
        let selectedType = event.detail.boatTypeId;

        // call searchBoats() from c/boatSearchResults
        this.template.querySelector('c-boat-search-results').searchBoats(selectedType);
    }

    createNewBoat() {
        // Navega para criação de novo barco
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        });
    }
}