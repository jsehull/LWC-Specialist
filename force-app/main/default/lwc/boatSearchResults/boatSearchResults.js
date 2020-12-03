import { api, LightningElement, track, wire } from 'lwc';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import boatMessageChannel from '@salesforce/messageChannel/BoatMessageChannel__c';
import { refreshApex } from '@salesforce/apex';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import BOAT_LENGTH_FIELD from '@salesforce/schema/Boat__c.Length__c';
import BOAT_PRICE_FIELD from '@salesforce/schema/Boat__c.Price__c';
import BOAT_DESCRIPTION_FIELD from '@salesforce/schema/Boat__c.Description__c';

const COLUMNS = [
    { label: 'Name', fieldName: BOAT_NAME_FIELD.fieldApiName, type: 'text', editable: true, },
    { label: 'Length', fieldName: BOAT_LENGTH_FIELD.fieldApiName, type: 'number', editable: true, },
    { label: 'Price', fieldName: BOAT_PRICE_FIELD.fieldApiName, type: 'currency', editable: true, },
    { label: 'Description', fieldName: BOAT_DESCRIPTION_FIELD.fieldApiName, type: 'text', editable: true, },
];

export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = COLUMNS;
    boatTypeId = '';
    @track draftValues = [];
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
    async refresh() {
        this.notifyLoading(true);
        await refreshApex(this.boats);
        this.notifyLoading(false);
    }

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
        this.notifyLoading(true);

        const updatedFields = event.detail.draftValues;
        console.log("🚀 / updatedFields", updatedFields)

        // Update the records via Apex
        updateBoatList({ data: updatedFields })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                }));

                this.draftValues = [];
                return this.refresh();
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                }));

                this.notifyLoading(false);
            })
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