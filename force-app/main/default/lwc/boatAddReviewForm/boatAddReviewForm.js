import { api, LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// imports
import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c';
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name';
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c';

const SUCCESS_TITLE = 'Review Created!';
const SUCCESS_VARIANT = 'success';

export default class BoatAddReviewForm extends LightningElement {
    // Private
    boatId;
    rating = 0;
    boatReviewObject = BOAT_REVIEW_OBJECT;
    nameField = NAME_FIELD;
    commentField = COMMENT_FIELD;
    labelSubject = 'Review Subject';
    labelRating = 'Rating';

    // Public Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        //sets boatId attribute
        this.setAttribute('boatId', value);
        //sets boatId assignment
        this.boatId = value;
    }

    // Gets user rating input from stars component
    handleRatingChanged(event) {
        let { rating } = event.detail;
        this.rating = rating;
    }

    // Custom submission handler to properly set Rating
    // This function must prevent the anchor element from navigating to a URL.
    // form to be submitted: lightning-record-edit-form
    handleSubmit(event) {
        // prevent the anchor element from navigating to a URL.
        event.preventDefault();

        // adds Boat__c and Rating__c
        const fields = event.detail.fields;
        fields.Boat__c = this.boatId;
        fields.Rating__c = this.rating;

        // submits the form
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    // Shows a toast message once form is submitted successfully
    // Dispatches event when a review is created
    handleSuccess() {
        // dispatch the custom event
        this.dispatchEvent(new CustomEvent('createreview'));

        // show the success message
        this.dispatchEvent(new ShowToastEvent({
            title: SUCCESS_TITLE,
            variant: SUCCESS_VARIANT
        }));

        // calls the handleReset() function, which clears the form’s data
        this.handleReset();
    }

    // Clears form data upon submission
    handleReset() {
        // reset each lightning-input-field
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }

        // reset rating
        this.rating = 0;
    }
}