document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Compose email listeners
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#buttons').style.display = 'none';
  document.querySelector('#messages-view').innerHTML = '';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#messages-view').innerHTML = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#buttons').style.display = 'none';
  document.querySelector('#messages-view').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  load_email(mailbox);
}

function load_email(mailbox) {

  document.querySelectorAll('.email-container').forEach((container) => {
    console.log(`deleting ${container}`);
    container.remove();
  });

  const user = document.querySelector('#user-email').innerHTML;
  const email_area = document.querySelector('#emails-view');
  
  // communicate with the API
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // print to understand JSON
    console.log(emails)

      emails.forEach(email => {

        const email_id = email.id;

        // INBOX 

        if (mailbox === 'inbox') {

          const read_status = email.read;

          email.recipients.forEach(recipient => {

            if (recipient === user) {

              // Create the container for each email
              const div = document.createElement('div');
  
              // Create the inner elements of the container
              const from = document.createElement('div'); 
              from.className = "col-3 font-weight-bold";
              const subject = document.createElement('div'); 
              subject.className = "col-6";
              const timestamp = document.createElement('div'); 
              timestamp.className = "col-3 text-right font-italic";
  
              // assign the email properties from the API to the HTML elements
              from.innerHTML = email.sender;
              subject.innerHTML = email.subject;
              timestamp.innerHTML = email.timestamp;
  
              div.append(from);
              div.append(subject);
              div.append(timestamp);
              div.setAttribute('data-email-id', email_id);
              div.setAttribute('data-email-inbox', mailbox);
              div.style.cursor = 'pointer';
  
              if (read_status) {
                div.className = "email-container bg-light row border border-dark rounded mt-1";
              }
              else {
                div.className = "email-container bg-white row border border-primary rounded mt-1";
              }

              email_area.append(div);
              
              AssignListener(div);
              
            }
          })
        }

        // SENT

        if (mailbox === 'sent') {

          if (email.sender === user) {

            // Create the container for each email
            const div = document.createElement('div');

            // Create the inner elements of the container
            const recipient = document.createElement('div'); 
            recipient.className = "col-3 font-weight-bold";
            const subject = document.createElement('div'); 
            subject.className = "col-6";
            const timestamp = document.createElement('div'); 
            timestamp.className = "col-3 text-right font-italic";

            // Get the recipients list
            let recipients_list = '';
            email.recipients.forEach(recipient => {
              if (recipients_list.length == 0) {
                recipients_list = recipient;
              } else {
                recipients_list = recipients_list + ', ' + recipient;
              }
            })
            
            // Assign the email properties from the API to the HTML elements
            recipient.innerHTML = recipients_list;
            subject.innerHTML = email.subject;
            timestamp.innerHTML = email.timestamp;

            div.append(recipient);
            div.append(subject);
            div.append(timestamp);
            div.setAttribute('data-email-id', email_id);
            div.setAttribute('data-email-inbox', mailbox);
            div.style.cursor = 'pointer';

            email_area.append(div);

            div.className = "email-container bg-light row border border-dark rounded mt-1";

            AssignListener(div);
          }
        }

        // ARCHIVE

        if (mailbox === 'archive') {

          let receiver = false;
          email.recipients.forEach(recipient => {
            if (recipient === user) {
              receiver = true;
            }
          })

          if (email.sender === user || receiver && email.archived) {

            // Create the container for each email
            const div = document.createElement('div');

            // Create the inner elements of the container
            const from = document.createElement('div'); 
            from.className = "col-3 font-weight-bold";
            const subject = document.createElement('div'); 
            subject.className = "col-6";
            const timestamp = document.createElement('div'); 
            timestamp.className = "col-3 text-right font-italic";

            // assign the email properties from the API to the HTML elements
            from.innerHTML = email.sender;
            subject.innerHTML = email.subject;
            timestamp.innerHTML = email.timestamp;

            div.append(from);
            div.append(subject);
            div.append(timestamp);
            div.setAttribute('data-email-id', email_id);
            div.setAttribute('data-email-inbox', mailbox);
            div.style.cursor = 'pointer';

            email_area.append(div);

            div.className = "email-container bg-light row border border-dark rounded mt-1";

            AssignListener(div);

          }
        }

      });
  });
}

function AssignListener(div) {

  const div_info = div;
  let archived_status = false;

  // assign the listener event for a click
  div.addEventListener('click', function() {
    console.log('This element has been clicked!')
    console.log(`You clicked on the email if ${div.dataset.emailId}.`);
    console.log(`You clicked this email from ${div.dataset.emailInbox}.`)

    // Set email as read
    fetch(`/emails/${div.dataset.emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
    
    fetch(`/emails/${div.dataset.emailId}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      // Hide emails
      document.querySelector('#emails-view').style.display = 'none'; 

      // Show the div
      document.querySelector('#email-content').style.display = 'block';

      // Get recipients list
      let recipients_list = '';
            email.recipients.forEach(recipient => {
              if (recipients_list.length == 0) {
                recipients_list = recipient;
              } else {
                recipients_list = recipients_list + ', ' + recipient;
              }
            })

      // Select the container for the email content to be displayed
      const div = document.querySelector('#email-content');

      // Create the inner elements of the container
      const subject = document.createElement('p');
      const from = document.createElement('p');
      const timestamp = document.createElement('p');
      const recipients = document.createElement('p');
      const body = document.createElement('p');

      // Assign the email properties from the API to the HTML elements
      subject.innerHTML = email.subject;
      from.innerHTML = email.sender;
      timestamp.innerHTML = email.timestamp;
      recipients.innerHTML = recipients_list;
      body.innerHTML = email.body;

      // Clear the HTML for each div
      document.querySelector("#email-subject").innerHTML = '';
      document.querySelector("#email-from").innerHTML = '';
      document.querySelector("#email-to").innerHTML = '';
      document.querySelector("#email-timestamp").innerHTML = '';
      document.querySelector("#email-body").innerHTML = '';

      // Append the HTML to correct div
      document.querySelector("#email-subject").append(subject);
      document.querySelector("#email-from").append(from);
      document.querySelector("#email-to").append(recipients);
      document.querySelector("#email-timestamp").append(timestamp);
      document.querySelector("#email-body").append(body);

      // Enable the buttons
      document.querySelector('#buttons').style.display = "block";

      // Archive button
      if (email.archived === false) {
        archived_status = false;
      } else {
        archived_status = true;
      }

      // Button checks (remove if they already exist)
      const archive_button = document.querySelector('#archive-button');
      if (archive_button) {
        archive_button.remove();
      }
      const reply_button = document.querySelector('#reply-button');
      if (reply_button) {
        reply_button.remove();
      }

      // Create the buttons
      if (div_info.dataset.emailInbox == "sent") {
        if (document.querySelector('#archive-button')) {
          document.querySelector('#archive-button').style.display = "none";
        }
      } else {
        create_archive_button(email.id, archived_status);
      }

      create_reply_button(email.id);

    });
  });
}

function create_reply_button(id) {

  const new_button = document.createElement('button'); 

  // Add the details
  new_button.className = "btn btn-sm btn-primary ml-1";
  new_button.id = "reply-button";
  new_button.innerHTML = "Reply";

  // Add the listener
  new_button.addEventListener('click', function() {

    // Set email archive status
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      // Reset the form
      compose_email();

      // Create values for the form:

      // Subject
      let respond_subject = email.subject;
      console.log(respond_subject.slice(0, 4));
      if (respond_subject.slice(0, 4) !== "Re: ") {
        respond_subject = "Re: " + email.subject;
      }

      // Body
      respond_body = "\n\nOn " + email.timestamp + " " + email.sender + " wrote: \n \n" + email.body;

      // Set the form values
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = respond_subject;
      document.querySelector('#compose-body').value = respond_body;

      new_button.remove();
    })

  });

  document.querySelector("#buttons").append(new_button);

}

function create_archive_button(id, archived_status) {

  const new_button = document.createElement('button'); 

  // Add the details
  new_button.className = "btn btn-sm btn-primary";
  new_button.id = "archive-button";
  if (archived_status) {
    new_button.innerHTML = "Unarchive";
  } else {
    new_button.innerHTML = "Archive";
  }

  // Add the listener
  new_button.addEventListener('click', function() {

    // Set email archive status
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: !archived_status
      })
    })
    .then(redirect => {
      load_mailbox('inbox');
      new_button.remove();
    })

  });

  document.querySelector("#buttons").append(new_button);

}

function send_email() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Check if each input is valid:
  if (recipients && subject && body) {

    // Communicate with API
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {

        // Print result
        console.log(result);
        const status_message = result.message;
        const error_message = result.error;

        if (status_message) {

          load_mailbox('sent')
          //document.querySelector('#messages-view').innerHTML = status_message;

        }

        if (error_message) {

          document.querySelector('#messages-view').innerHTML = error_message;

        }
    });

  }
  else {
      // Display error on the screen
      alert('Please include a recipient, subject and message.')
  }

  // Stop form from submitting
  return false;

}
