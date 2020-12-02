import { api, LightningElement, track, wire } from 'lwc';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { publish, MessageContext } from 'lightning/messageService';
import boatMessageChannel from '@salesforce/messageChannel/BoatMessageChannel__c';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = [];
    boatTypeId = '';
    @track boats;
    isLoading = false;

    // wired message context
    @wire(MessageContext)
    messageContext;

    // wired getBoats method
    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        this.notifyLoading(false);
        this.boats = result.data;
    }

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        this.notifyLoading(true);
        this.boatTypeId = boatTypeId;
    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    refresh() { }

    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        console.log("🚀 / updateSelectedTile ", event.detail.boatId);
        const selectedBoatId = event.detail.boatId;
        this.selectedBoatId = selectedBoatId;
        this.sendMessageService(selectedBoatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        // explicitly pass boatId to the parameter recordId
        const payload = { recordId: boatId };

        publish(this.messageContext, boatMessageChannel, payload);
    }

    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        // notify loading
        const updatedFields = event.detail.draftValues;
        // Update the records via Apex
        updateBoatList({ data: updatedFields })
            .then(() => { })
            .catch(error => { })
            .finally(() => { });
    }

    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        this.isLoading = isLoading;
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading'));
        } else {
            this.dispatchEvent(new CustomEvent('doneloading'));
        }
    }
}