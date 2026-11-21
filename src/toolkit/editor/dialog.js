// One <dialog> for every confirmation. ask() resolves with { value, text } where value is the chosen action
// ('cancel' on Esc). With `input`, a job-word field is shown and checked before a non-cancel action closes it.
const $ = (id) => document.getElementById(id);

export function ask({ title, body, actions, input }) {
  const dlg = $('dlg');
  const form = $('dlg-form');
  $('dlg-h').textContent = title;
  $('dlg-body').replaceChildren(...[].concat(body).map((t) => Object.assign(document.createElement('p'), { textContent: t })));
  const field = $('dlg-job');
  const err = $('dlg-job-error');
  $('dlg-input').hidden = !input;
  err.hidden = true;
  const showPreview = () => ($('dlg-preview').textContent = `${field.value || '…'}Womp`);
  if (input) {
    field.value = input.initial ?? '';
    field.oninput = () => {
      err.hidden = true;
      field.removeAttribute('aria-invalid');
      showPreview();
    };
    showPreview();
  }
  $('dlg-actions').replaceChildren(
    ...actions.map((a) => {
      const b = document.createElement('button');
      b.className = `b ${a.kind === 'primary' ? 'b-ink' : a.kind === 'danger' ? 'b-danger-solid' : ''}`;
      b.value = a.value;
      b.textContent = a.label;
      if (a.value === 'cancel') b.formNoValidate = true;
      return b;
    }),
  );
  return new Promise((resolve) => {
    form.onsubmit = (e) => {
      const value = e.submitter?.value ?? 'cancel';
      if (input && value !== 'cancel') {
        const problem = input.validate(field.value);
        if (problem) {
          e.preventDefault();
          err.textContent = problem;
          err.hidden = false;
          field.setAttribute('aria-invalid', 'true');
          field.focus();
          return;
        }
      }
      dlg.returnValue = value;
    };
    dlg.addEventListener(
      'close',
      () => resolve({ value: dlg.returnValue || 'cancel', text: field.value }),
      { once: true },
    );
    dlg.returnValue = '';
    dlg.showModal();
    if (input) field.focus();
    else dlg.querySelector('.dlg-actions button')?.focus();
  });
}
