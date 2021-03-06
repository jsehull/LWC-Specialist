import { api, LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getFieldValue, getRecord } from 'lightning/uiRecordApi';

// Message Service
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { APPLICATION_SCOPE, MessageContext, subscribe } from 'lightning/messageService';

// Custom Labels Imports
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

// Boat__c Schema Imports
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    };
    @api boatId;

    // Initialize messageContext for Message Service
    @wire(MessageContext)
    messageContext;

    // Wire the getRecord method using ('$boatId')
    @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
    wiredRecord;

    // Decide when to show or hide the icon
    // returns 'utility:anchor' or null
    get detailsTabIconName() {
        return this.wiredRecord.data ? 'utility:anchor' : null;
    }

    // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
    }

    // Private
    subscription = null;

    // Subscribe to the message channel
    subscribeMC() {
        // local boatId must receive the recordId from the message
        // should not update when this component is on a record page.
        if (this.subscription || this.recordId) {
            return;
        }
        // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
        this.subscription = subscribe(
            this.messageContext,
            BOATMC,
            (message) => this.boatId = message.recordId, // OU this.handleMessage(message),
            { scope: APPLICATION_SCOPE }
        );
    }

    // Handler for message received by component
    handleMessage(message) {
        const { recordId } = message;
        this.boatId = recordId;
    }

    // Calls subscribeMC()
    connectedCallback() {
        this.subscribeMC();
    }

    // Navigates to record page
    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                actionName: 'view'
            }
        });
    }

    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() {
        this.template.querySelector("lightning-tabset").activeTabValue = 'reviews';
        this.template.querySelector("c-boat-reviews").refresh();
    }
}