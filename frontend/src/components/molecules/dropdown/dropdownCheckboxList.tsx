import React, {Component, createRef} from 'react';
import IconButton from '../icon-button/iconButton';
import './dropdown.css';
import assert from 'assert';
import {
  DropdownCheckboxListProps,
  DropdownState,
  generateCheckboxOptions,
} from './dropdownFunctions';

export default class DropdownCheckboxList extends Component<
  DropdownCheckboxListProps,
  DropdownState
> {
  private fullprops: DropdownCheckboxListProps;
  private componentRef = createRef<HTMLDivElement>();
  private dropdownClickCount = 0;
  private checkboxOptions;
  constructor(props: DropdownCheckboxListProps) {
    super(props);
    this.state = {
      listVisibility: 'closed',
      selectedOption: 0,
    };
    this.fullprops = new DropdownCheckboxListProps(this.props);
    this.checkboxOptions = generateCheckboxOptions(
      this.fullprops.options as string[],
      this.fullprops.size as string,
      this.fullprops.indicesToSelect
    );
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount(): void {
    this.componentRef.current?.addEventListener(
      'click',
      (event: MouseEvent) => {
        console.log(event.target + 'mount');
        event.stopImmediatePropagation();
        if (this.dropdownClickCount === 1) {
          this.handleClose();
          console.log(this.dropdownClickCount);
        } else {
          this.setState({listVisibility: 'open'});
          this.dropdownClickCount++;
        }
      }
    );

    this.checkboxOptions.forEach(option => {
      const optionElement = document.getElementById(String(option.key));
      optionElement?.addEventListener('click', (event: MouseEvent) => {
        event.stopImmediatePropagation();
        console.log('heyoo');
        const input = optionElement.querySelector('input');
        const editor = this.props.columnToSelectEditor;
        if (!input) return;
        else if (input.checked) {
          input.checked = false;
          if (editor) editor(Number(input.name), 'remove');
        } else {
          input.checked = true;
          if (editor) editor(Number(input.name), 'add');
        }
      });
    });
  }

  handleClose() {
    this.setState({listVisibility: 'closed'});
    this.dropdownClickCount = 0;
  }

  componentDidUpdate(
    prevProps: Readonly<DropdownCheckboxListProps>,
    prevState: Readonly<DropdownState>
  ): void {
    if (
      prevState.listVisibility === 'closed' &&
      this.state.listVisibility === 'open'
    ) {
      document.addEventListener('click', this.handleClose);
    } else {
      document.removeEventListener('click', this.handleClose);
    }
  }

  render() {
    const {id, options, iconName, colour, filled, outlined, size} =
      this.fullprops;
    assert(iconName);
    assert(options);

    const {listVisibility, selectedOption} = this.state;

    return (
      <div ref={this.componentRef} className="dropDownWrapper" id={id}>
        <IconButton
          iconName={iconName}
          buttonText={{text: options[selectedOption], textPosition: 'front'}}
          clickHandler={() => {}}
          iconColour={colour}
          outlined={outlined}
          filled={filled}
          dropdown={true}
          size={'sm'}
        />
        <div
          className="dropdownList"
          style={{display: listVisibility === 'open' ? 'flex' : 'none'}}
        >
          {this.checkboxOptions}
        </div>
      </div>
    );
  }
}
